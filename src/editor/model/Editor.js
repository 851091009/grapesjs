var deps = [
require('utils'),
require('storage_manager'),
require('device_manager'),
require('parser'),
require('selector_manager'),
require('modal_dialog'),
require('code_manager'),
require('panels'),
require('rich_text_editor'),
require('style_manager'),
require('asset_manager'),
require('css_composer'),
require('dom_components'),
require('canvas'),
require('commands'),
require('block_manager'),
require('trait_manager'),
];

var Backbone    = require('backbone');
var UndoManager = require('backbone-undo'); // 撤销管理器
var key         = require('keymaster'); // 键盘管理器
var timedInterval;

module.exports = Backbone.Model.extend({
  // 设置默认值
  defaults: {
    clipboard: null,
    designerMode: false,
    selectedComponent: null,
    previousModel: null,
    changesCount:  0,
    storables: [],
    modules: [],
    toLoad: [],
    opened: {},
    device: '',
  },
  // 构造函数
  initialize(c) {
    this.config = c;
    this.set('Config', c);
    this.set('modules', []);

    if(c.el && c.fromElement)
      this.config.components = c.el.innerHTML;

    // Load modules
    // 加载模块
    deps.forEach(function(name){
      this.loadModule(name);
    }, this);

    // Call modules with onLoad callback
    // 调用onLoad回调模块
    this.get('toLoad').forEach(M => {
      M.onLoad();
    });

    this.loadOnStart();
    this.initUndoManager();

    this.on('change:selectedComponent', this.componentSelected, this);
    this.on('change:changesCount', this.updateBeforeUnload, this);
  },

  /**
   * Load on start if it was requested
   * 如果需要，在开始时加载
   * @private
   */
  loadOnStart() {
    const sm = this.get('StorageManager');

    if (sm && sm.getConfig().autoload) {
      this.load();
    }
  },

  /**
   * Set the alert before unload in case it's requested 卸载前设置警报，以防请求。
   * and there are unsaved changes 有未保存的更改
   * @private
   */
  updateBeforeUnload() {
    var changes = this.get('changesCount');

    if (this.config.noticeOnUnload && changes) {
      window.onbeforeunload = e => 1;
    } else {
      window.onbeforeunload = null;
    }
  },

  /**
   * Load generic module
   * 负载通用模块
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  loadModule(moduleName) {
    var c = this.config;
    var M = new moduleName();
    var name = M.name.charAt(0).toLowerCase() + M.name.slice(1);
    var cfg = c[name] || c[M.name] || {};
    cfg.pStylePrefix = c.pStylePrefix || '';

    // Check if module is storable
    var sm = this.get('StorageManager');
    if(M.storageKey && M.store && M.load && sm){
      cfg.stm = sm;
      var storables = this.get('storables');
      storables.push(M);
      this.set('storables', storables);
    }
    cfg.em = this;
    M.init(Object.create(cfg));

    // Bind the module to the editor model if public
    if(!M.private)
      this.set(M.name, M);

    if(M.onLoad)
      this.get('toLoad').push(M);

    this.get('modules').push(M);
    return this;
  },

  /**
   * Initialize editor model and set editor instance
   * 初始化编辑器模型和集合编辑器实例
   * @param {Editor} editor Editor instance
   * @return {this}
   * @private
   */
  init(editor) {
    this.set('Editor', editor);
  },

  /**
   * Listen for new rules
   * 倾听新规则
   * @param {Object} collection
   * @private
   */
  listenRules(collection) {
    this.stopListening(collection, 'add remove', this.listenRule);
    this.listenTo(collection, 'add remove', this.listenRule);
    collection.each(function(model){
      this.listenRule(model);
    }, this);
  },

  /**
   * Listen for rule changes
   * 监听规则更改
   * @param {Object} model
   * @private
   */
  listenRule(model) {
    this.stopListening(model, 'change:style', this.componentsUpdated);
    this.listenTo(model, 'change:style', this.componentsUpdated);
  },

  /**
   * Triggered when something in components is changed
   * 当组件中的某事物发生更改时触发。
   * @param  {Object}  model
   * @param  {Mixed}    val  Value
   * @param  {Object}  opt  Options
   * @private
   * */
  componentsUpdated(model, val, opt) {
    var temp = opt ? opt.temporary : 0;
    if (temp) {
      // component has been added temporarily - do not update storage or record changes
      // 组件已临时添加-不更新存储或记录更改
      return;
    }

    timedInterval && clearInterval(timedInterval);
    timedInterval = setTimeout(() => {
      var count = this.get('changesCount') + 1;
      var avoidStore = opt ? opt.avoidStore : 0;
      var stm = this.get('StorageManager');
      this.set('changesCount', count);

      if (!stm.isAutosave() || count < stm.getStepsBeforeSave()) {
        return;
      }

      if (!avoidStore) {
        this.store();
      }
    }, 0);
  },

  /**
   * Initialize Undo manager
   * 初始化撤消管理
   * @private
   * */
  initUndoManager() {
    if(this.um)
      return;
    var cmp = this.get('DomComponents');
    if(cmp && this.config.undoManager){
      var that = this;
      this.um = new UndoManager({
          register: [cmp.getComponents(), this.get('CssComposer').getAll()],
          track: true
      });
      this.UndoManager = this.um;
      this.set('UndoManager', this.um);
      key('⌘+z, ctrl+z', () => {
        that.um.undo(true);
        that.trigger('component:update');
      });
      key('⌘+shift+z, ctrl+shift+z', () => {
        that.um.redo(true);
        that.trigger('component:update');
      });

      var beforeCache;
      const customUndoType = {
        on: function (model, value, opts) {
          var opt = opts || {};
          if(!beforeCache){
            beforeCache = model.previousAttributes();
          }
          if (opt && opt.avoidStore) {
            return;
          } else {
            var obj = {
                "object": model,
                "before": beforeCache,
                "after": model.toJSON()
            };
            beforeCache = null;
            return obj;
          }
        },
        undo: function (model, bf, af, opt) {
          model.set(bf);
          // Update also inputs inside Style Manager
          // 更新样式管理器中的输入
          that.trigger('change:selectedComponent');
        },
        redo: function (model, bf, af, opt) {
          model.set(af);
          // Update also inputs inside Style Manager
          // 更新样式管理器中的输入
          that.trigger('change:selectedComponent');
        }
      };
      UndoManager.removeUndoType("change");
      UndoManager.addUndoType("change:style", customUndoType);
      UndoManager.addUndoType("change:content", customUndoType);
    }
  },

  /**
   * Callback on component selection
   * 组件选择回调
   * @param   {Object}   Model
   * @param   {Mixed}   New value
   * @param   {Object}   Options
   * @private
   * */
  componentSelected(model, val, options) {
    if(!this.get('selectedComponent'))
      this.trigger('deselect-comp');
    else
      this.trigger('select-comp',[model,val,options]);
  },

  /**
   * Triggered when components are updated
   * 组件更新时触发
   * @param  {Object}  model
   * @param  {Mixed}    val  Value
   * @param  {Object}  opt  Options
   * @private
   * */
  updateComponents(model, val, opt) {
    var comps  = model.get('components'),
        classes  = model.get('classes'),
        avSt  = opt ? opt.avoidStore : 0;

    // Observe component with Undo Manager
    // 使用撤销管理器观察组件
    if(this.um)
      this.um.register(comps);

    // Call stopListening for not creating nested listeners
    // 电话监听不创建嵌套的听众
    this.stopListening(comps, 'add', this.updateComponents);
    this.stopListening(comps, 'remove', this.rmComponents);
    this.listenTo(comps, 'add', this.updateComponents);
    this.listenTo(comps, 'remove', this.rmComponents);

    this.stopListening(classes, 'add remove', this.componentsUpdated);
    this.listenTo(classes, 'add remove', this.componentsUpdated);

    var evn = 'change:style change:content change:attributes';
    this.stopListening(model, evn, this.componentsUpdated);
    this.listenTo(model, evn, this.componentsUpdated);

    if(!avSt)
      this.componentsUpdated(model, val, opt);
  },

  /**
   * Init stuff like storage for already existing elements
   * init之类的东西，比如已经存在的元素的存储
   * @param {Object}  model
   * @private
   */
  initChildrenComp(model) {
      var comps  = model.get('components');
      this.updateComponents(model, null, { avoidStore : 1 });
      comps.each(function(md) {
          this.initChildrenComp(md);
          if(this.um)
            this.um.register(md);
      }, this);
  },

  /**
   * Triggered when some component is removed updated
   * 当某些组件被移除更新时触发。
   * @param  {Object}  model
   * @param  {Mixed}    val  Value
   * @param  {Object}  opt  Options
   * @private
   * */
  rmComponents(model, val, opt) {
    var avSt  = opt ? opt.avoidStore : 0;

    if(!avSt)
      this.componentsUpdated(model, val, opt);
  },

  /**
   * Returns model of the selected component
   * 返回所选组件的模型
   * @return {Component|null}
   * @private
   */
  getSelected() {
    return this.get('selectedComponent');
  },

  /**
   * Select a component
   * 选择一个组件
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} opts Options, optional
   * @private
   */
  setSelected(el, opts = {}) {
    let model = el;

    if (el instanceof HTMLElement) {
      model = $(el).data('model');
    }

    this.set('selectedComponent', model, opts);
  },

  /**
   * Set components inside editor's canvas. This method overrides actual components
   * 在编辑器的画布中设置组件。此方法覆盖实际组件。
   * @param {Object|string} components HTML string or components model
   * @return {this}
   * @private
   */
  setComponents(components) {
    return this.get('DomComponents').setComponents(components);
  },

  /**
   * Returns components model from the editor's canvas
   * 从编辑器的画布返回组件模型
   * @return {Components}
   * @private
   */
  getComponents() {
    var cmp = this.get('DomComponents');
    var cm = this.get('CodeManager');

    if(!cmp || !cm)
      return;

    var wrp  = cmp.getComponents();
    return cm.getCode(wrp, 'json');
  },

  /**
   * Set style inside editor's canvas. This method overrides actual style
   * 在编辑器的画布中设置样式。此方法重写实际样式。
   * @param {Object|string} style CSS string or style model
   * @return {this}
   * @private
   */
  setStyle(style) {
    var rules = this.get('CssComposer').getAll();
    for(var i = 0, len = rules.length; i < len; i++)
      rules.pop();
    rules.add(style);
    return this;
  },

  /**
   * Returns rules/style model from the editor's canvas
   * 从编辑器的画布返回规则/样式模型
   * @return {Rules}
   * @private
   */
  getStyle() {
    return this.get('CssComposer').getAll();
  },

  /**
   * Returns HTML built inside canvas
   * 返回内置在画布中的HTML
   * @return {string} HTML string
   * @private
   */
  getHtml() {
    const config = this.config;
    const exportWrapper = config.exportWrapper;
    const wrappesIsBody = config.wrappesIsBody;
    const js = config.jsInHtml ? this.getJs() : '';
    var wrp  = this.get('DomComponents').getComponent();
    var html = this.get('CodeManager').getCode(wrp, 'html', {
      exportWrapper, wrappesIsBody
    });
    html += js ? `<script>${js}</script>` : '';
    return html;
  },

  /**
   * Returns CSS built inside canvas
   * 返回CSS内置在画布
   * @return {string} CSS string
   * @private
   */
  getCss() {
    const config = this.config;
    const wrappesIsBody = config.wrappesIsBody;
    var cssc = this.get('CssComposer');
    var wrp = this.get('DomComponents').getComponent();
    var protCss = config.protectedCss;

    return protCss + this.get('CodeManager').getCode(wrp, 'css', {
      cssc, wrappesIsBody
    });
  },

  /**
   * Returns JS of all components
   * 返回所有组件的js
   * @return {string} JS string
   * @private
   */
  getJs() {
    var wrp = this.get('DomComponents').getWrapper();
    return this.get('CodeManager').getCode(wrp, 'js').trim();
  },

  /**
   * Store data to the current storage
   * 保存当前数据
   * @param {Function} clb Callback function
   * @return {Object} Stored data
   * @private
   */
  store(clb) {
    var sm = this.get('StorageManager');
    var store = {};
    if(!sm)
      return;

    // Fetch what to store
    this.get('storables').forEach(m => {
      var obj = m.store(1);
      for(var el in obj)
        store[el] = obj[el];
    });

    sm.store(store, () => {
      clb && clb();
      this.set('changesCount', 0);
      this.trigger('storage:store', store);
    });

    return store;
  },

  /**
   * Load data from the current storage
   * 从当前存储中加载数据
   * @param {Function} clb Callback function
   * @return {Object} Loaded data
   * @private
   */
  load(clb) {
    var result = this.getCacheLoad(1, clb);
    this.get('storables').forEach(m => {
      m.load(result);
    });
    return result;
  },

  /**
   * Returns cached load
   * 返回缓存负载
   * @param {Boolean} force Force to reload
   * @param {Function} clb Callback function
   * @return {Object}
   * @private
   */
  getCacheLoad(force, clb) {
    var f = force ? 1 : 0;
    if(this.cacheLoad && !f)
      return this.cacheLoad;
    var sm = this.get('StorageManager');
    var load = [];

    if(!sm)
      return {};

    this.get('storables').forEach(m => {
      var key = m.storageKey;
      key = typeof key === 'function' ? key() : key;
      var keys = key instanceof Array ? key : [key];
      keys.forEach(k => {
        load.push(k);
      });
    });

    this.cacheLoad = sm.load(load, (loaded) => {
      clb && clb(loaded);
      this.trigger('storage:load', loaded);
    });
    return this.cacheLoad;
  },

  /**
   * Returns device model by name
   * 按名称返回设备模型
   * @return {Device|null}
   * @private
   */
  getDeviceModel() {
    var name = this.get('device');
    return this.get('DeviceManager').get(name);
  },

  /**
   * Run default command if setted
   * 如果设置运行默认的命令
   * @private
   */
  runDefault() {
    var command = this.get('Commands').get(this.config.defaultCommand);
    if(!command || this.defaultRunning)
      return;
    command.stop(this, this);
    command.run(this, this);
    this.defaultRunning = 1;
  },

  /**
   * Stop default command
   * 停止默认命令
   * @private
   */
  stopDefault() {
    var command = this.get('Commands').get(this.config.defaultCommand);
    if(!command)
      return;
    command.stop(this, this);
    this.defaultRunning = 0;
  },

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * 更新画布尺寸并刷新用于工具定位的数据
   * @private
   */
  refreshCanvas() {
    this.set('canvasOffset', this.get('Canvas').getOffset());
  },

  /**
   * Clear all selected stuf inside the window, sometimes is useful to call before 清除所有选择的东西里面的窗口，有时是电话之前有用
   * doing some dragging opearation 拖动的操作
   * @param {Window} win If not passed the current one will be used
   * @private
   */
  clearSelection(win) {
    var w = win || window;
    w.getSelection().removeAllRanges();
  },

});
