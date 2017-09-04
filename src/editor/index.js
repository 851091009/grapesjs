/**
 * 编辑器的函数
 * * [getConfig](#getconfig)
 * * [getHtml](#gethtml) - 获取html
 * * [getCss](#getcss)
 * * [getJs](#getjs)
 * * [getComponents](#getcomponents)
 * * [setComponents](#setcomponents)
 * * [addComponents](#addcomponents)
 * * [getStyle](#getstyle)
 * * [setStyle](#setstyle)
 * * [getSelected](#getselected)
 * * [getSelectedToStyle](#getselectedtostyle)
 * * [setDevice](#setdevice)
 * * [getDevice](#getdevice)
 * * [runCommand](#runcommand)
 * * [stopCommand](#stopcommand)
 * * [store](#store)
 * * [load](#load)
 * * [getContainer](#getcontainer)
 * * [refresh](#refresh)
 * * [on](#on)
 * * [off](#off)
 * * [trigger](#trigger)
 * * [render](#render)
 *
 * Editor class contains the top level API which you'll probably use to custom the editor or extend it with plugins. 编辑器类包含顶级API，您可能会使用它来定制编辑器或用插件扩展它。
 * You get the Editor instance on init method
 * 获取init方法的编辑器实例
 * ```js
 * var editor = grapesjs.init({...});
 * ```
 *
 * **Available Events** 可用事件
 * * `component:add` - Triggered when a new component is added to the editor, the model is passed as an argument to the callback 当将新组件添加到编辑器时，该模型将作为参数传递给回调。
 * * `component:update` - Triggered when a component is, generally, updated (moved, styled, etc.) 当组件是更新的（移动、样式等）时触发的。
 * * `component:update:{propertyName}` - Listen any property change 监听任何属性改变
 * * `component:styleUpdate` - Triggered when the style of the component is updated 当组件的样式被更新时触发。
 * * `component:styleUpdate:{propertyName}` - Listen for a specific style property change 监听特定样式属性更改。
 * * `asset:add` - New asset added 新的资产增值
 * * `asset:remove` - Asset removed 资产删除
 * * `asset:upload:start` - Before the upload is started 在上传开始之前
 * * `asset:upload:end` - After the upload is ended 上传结束后
 * * `asset:upload:error` - On any error in upload, passes the error as an argument 上载时的任何错误，都会将该错误作为参数传递。
 * * `asset:upload:response` - On upload response, passes the result as an argument 在上载响应上，将结果作为参数传递。
 * * `styleManager:change` - Triggered on style property change from new selected component, the view of the property is passed as an argument to the callback 在新选定组件的样式属性更改触发时，属性视图作为回调参数传递给回调。
 * * `styleManager:change:{propertyName}` - As above but for a specific style property 如上所述，但对于特定样式属性
 * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argumnet 触发时，有东西从存储加载，加载对象传递一个argumnet
 * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argumnet 触发时，一些存储在存储，存储的对象传递一个argumnet
 * * `selector:add` - Triggers when a new selector/class is created 当创建一个新的选择器/类时触发。
 * * `canvasScroll` - Triggered when the canvas is scrolled 触发时，画布上滚动
 * * `run:{commandName}` - Triggered when some command is called to run (eg. editor.runCommand('preview')) 触发时，一些命令来运行（如编辑。RunCommand（'preview '））
 * * `stop:{commandName}` - Triggered when some command is called to stop (eg. editor.stopCommand('preview')) 触发时，一些命令来停止（如编辑。stopcommand（'preview '））
 * * `load` - When the editor is loaded 当编辑器加载时
 *
 * @module Editor
 * @param {Object} config Configurations 配置
 * @param {string} config.container='' Selector for the editor container, eg. '#myEditor'  编辑器容器的选择器
 * @param {string|Array<Object>} [config.components=''] HTML string or object of components HTML字符串或组件对象
 * @param {string|Array<Object>} [config.style=''] CSS string or object of rules CSS字符串或规则对象
 * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container 如果为true，将从选定容器中获取HTML和CSS。
 * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components 启用/禁用复制（Ctrl + C）和粘贴（Ctrl + V）组件的可能性
 * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager 启用/禁用撤消管理器
 * @param {Boolean} [config.autorender=true] If true renders editor on init 如果TRUE在init上呈现编辑器
 * @param {Boolean} [config.noticeOnUnload=true] Enable/Disable alert message before unload the page 在卸载页面之前启用/禁用警报消息
 * @param {string} [config.height='900px'] Height for the editor container 编辑器容器的高度
 * @param {string} [config.width='100%'] Width for the editor container 编辑器容器的宽度
 * @param {Object} [config.storage={}] Storage manager configuration, see the relative documentation 存储管理器配置，请参见相关文档
 * @param {Object} [config.styleManager={}] Style manager configuration, see the relative documentation 样式管理器配置，请参见相关文档
 * @param {Object} [config.commands={}] Commands configuration, see the relative documentation 命令配置，请参见相关文档
 * @param {Object} [config.domComponents={}] Components configuration, see the relative documentation 组件配置，请参见相关文档
 * @param {Object} [config.panels={}] Panels configuration, see the relative documentation 面板配置，请参见相关文档
 * @param {Object} [config.showDevices=true] If true render a select of available devices inside style manager panel 如果为真，在样式管理面板中显示可用设备的选择
 * @param {string} [config.defaultCommand='select-comp'] Command to execute when no other command is running 命令在没有其他命令运行时执行
 * @param {Array} [config.plugins=[]] Array of plugins to execute on start 开始执行的插件数组
 * @param {Object} [config.pluginsOpts={}] Custom options for plugins 插件的自定义选项
 * @example
 * var editor = grapesjs.init({
 *   container : '#gjs',
 *   components: '<div class="txt-red">Hello world!</div>',
 *   style: '.txt-red{color: red}',
 * });
 */

module.exports = config => {
  var c = config || {},
  defaults    = require('./config/config'),
  EditorModel = require('./model/Editor'),
  EditorView  = require('./view/EditorView');

  for (var name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  c.pStylePrefix = c.stylePrefix;
  var em = new EditorModel(c);
  var editorView = new EditorView({
      model: em,
      config: c,
  });

  return {

    /**
     * @property {EditorModel}
     * @private
     */
    editor: em,

    /**
     * @property {DomComponents}
     * @private
     */
    DomComponents: em.get('DomComponents'),

    /**
     * @property {CssComposer}
     * @private
     */
    CssComposer: em.get('CssComposer'),

    /**
     * @property {StorageManager}
     * @private
     */
    StorageManager: em.get('StorageManager'),

    /**
     * @property {AssetManager}
     */
    AssetManager: em.get('AssetManager'),

    /**
     * @property {BlockManager}
     * @private
     */
    BlockManager: em.get('BlockManager'),

    /**
     * @property {TraitManager}
     * @private
     */
    TraitManager: em.get('TraitManager'),

    /**
     * @property {SelectorManager}
     * @private
     */
    SelectorManager: em.get('SelectorManager'),

    /**
     * @property {CodeManager}
     * @private
     */
    CodeManager: em.get('CodeManager'),

    /**
     * @property {Commands}
     * @private
     */
    Commands: em.get('Commands'),

    /**
     * @property {Modal}
     * @private
     */
    Modal: em.get('Modal'),

    /**
     * @property {Panels}
     * @private
     */
    Panels: em.get('Panels'),

    /**
     * @property {StyleManager}
     * @private
     */
    StyleManager: em.get('StyleManager'),

    /**
     * @property {Canvas}
     * @private
     */
    Canvas: em.get('Canvas'),

    /**
     * @property {UndoManager}
     * @private
     */
    UndoManager: em.get('UndoManager'),

    /**
     * @property {DeviceManager}
     * @private
     */
    DeviceManager: em.get('DeviceManager'),

    /**
     * @property {RichTextEditor}
     * @private
     */
    RichTextEditor: em.get('rte'),

    /**
     * @property {Utils}
     * @private
     */
    Utils: em.get('Utils'),

    /**
     * @property {Utils}
     * @private
     */
    Config: em.get('Config'),

    /**
     * Initialize editor model
     * @return {this}
     * @private
     */
    init() {
      em.init(this);
      return this;
    },

    /**
     * Returns configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Returns HTML built inside canvas
     * @return {string} HTML string
     */
    getHtml() {
      return em.getHtml();
    },

    /**
     * Returns CSS built inside canvas
     * @return {string} CSS string
     */
    getCss() {
      return em.getCss();
    },

    /**
     * Returns JS of all components
     * @return {string} JS string
     */
    getJs() {
      return em.getJs();
    },

    /**
     * Returns components in JSON format object
     * @return {Object}
     */
    getComponents() {
      return em.get('DomComponents').getComponents();
    },

    /**
     * Set components inside editor's canvas. This method overrides actual components
     * @param {Array<Object>|Object|string} components HTML string or components model
     * @return {this}
     * @example
     * editor.setComponents('<div class="cls">New component</div>');
     * // or
     * editor.setComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     */
    setComponents(components) {
      em.setComponents(components);
      return this;
    },

    /**
     * Add components
     * @param {Array<Object>|Object|string} components HTML string or components model
     * @param {Object} opts Options
     * @param {Boolean} [opts.avoidUpdateStyle=false] If the HTML string contains styles,
     * by default, they will be created and, if already exist, updated. When this option
     * is true, styles already created will not be updated.
     * @return {Model|Array<Model>}
     * @example
     * editor.addComponents('<div class="cls">New component</div>');
     * // or
     * editor.addComponents({
     *  type: 'text',
     *   classes:['cls'],
     *   content: 'New component'
     * });
     */
    addComponents(components, opts) {
      return this.getComponents().add(components, opts);
    },

    /**
     * Returns style in JSON format object
     * @return {Object}
     */
    getStyle() {
      return em.get('CssComposer').getAll();
    },

    /**
     * Set style inside editor's canvas. This method overrides actual style
     * @param {Array<Object>|Object|string} style CSS string or style model
     * @return {this}
     * @example
     * editor.setStyle('.cls{color: red}');
     * //or
     * editor.setStyle({
     *   selectors: ['cls']
     *   style: { color: 'red' }
     * });
     */
    setStyle(style) {
      em.setStyle(style);
      return this;
    },

    /**
     * Returns selected component, if there is one
     * @return {Model}
     */
    getSelected() {
      return em.getSelected();
    },

    /**
     * Get a stylable entity from the selected component.
     * If you select a component without classes the entity is the Component
     * itself and all changes will go inside its 'style' attribute. Otherwise,
     * if the selected component has one or more classes, the function will
     * return the corresponding CSS Rule
     * @return {Model}
     */
    getSelectedToStyle() {
      let selected = em.getSelected();

      if (selected) {
        return this.StyleManager.getModelToStyle(selected);
      }
    },

    /**
     * Select a component
     * @param  {Component|HTMLElement} el Component to select
     * @return {this}
     * @example
     * // Select dropped block
     * editor.on('block:drag:stop', function(model) {
     *  editor.select(model);
     * });
     */
    select(el) {
      em.setSelected(el);
      return this;
    },

    /**
     * Set device to the editor. If the device exists it will
     * change the canvas to the proper width
     * @param {string} name Name of the device
     * @return {this}
     * @example
     * editor.setDevice('Tablet');
     */
    setDevice(name) {
      em.set('device', name);
      return this;
    },

    /**
     * Return the actual active device
     * @return {string} Device name
     * @example
     * var device = editor.getDevice();
     * console.log(device);
     * // 'Tablet'
     */
    getDevice() {
      return em.get('device');
    },

    /**
     * Execute command
     * @param {string} id Command ID
     * @param {Object} options Custom options
     * @return {*} The return is defined by the command
     * @example
     * editor.runCommand('myCommand', {someValue: 1});
     */
    runCommand(id, options) {
      var result;
      var command = em.get('Commands').get(id);

      if(command){
        result = command.run(this, this, options);
        this.trigger('run:' + id);
      }
      return result;
    },

    /**
     * Stop the command if stop method was provided
     * @param {string} id Command ID
     * @param {Object} options Custom options
     * @return {*} The return is defined by the command
     * @example
     * editor.stopCommand('myCommand', {someValue: 1});
     */
    stopCommand(id, options) {
      var result;
      var command = em.get('Commands').get(id);

      if(command){
        result = command.stop(this, this, options);
        this.trigger('stop:' + id);
      }
      return result;
    },

    /**
     * Store data to the current storage
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    store(clb) {
      return em.store(clb);
    },

    /**
     * Load data from the current storage
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    load(clb) {
      return em.load(clb);
    },

    /**
     * Returns container element. The one which was indicated as 'container'
     * on init method
     * @return {HTMLElement}
     */
    getContainer() {
      return c.el;
    },

    /**
     * Update editor dimensions and refresh data useful for positioning of tools
     *
     * This method could be useful when you update, for example, some position
     * of the editor element (eg. canvas, panels, etc.) with CSS, where without
     * refresh you'll get misleading position of tools (eg. rich text editor,
     * component highlighter, etc.)
     *
     * @private
     */
    refresh() {
      em.refreshCanvas();
    },

    /**
     * Replace the built-in Rich Text Editor with a custom one.
     * @param {Object} obj Custom RTE Interface
     * @example
     * editor.setCustomRte({
     *   // Function for enabling custom RTE
     *   // el is the HTMLElement of the double clicked Text Component
     *   // rte is the same instance you have returned the first time you call
     *   // enable(). This is useful if need to check if the RTE is already enabled so
     *   // ion this case you'll need to return the RTE and the end of the function
     *   enable: function(el, rte) {
     *     rte = new MyCustomRte(el, {}); // this depends on the Custom RTE API
     *     ...
     *     return rte; // return the RTE instance
     *   },
     *
     *   // Disable the editor, called for example when you unfocus the Text Component
     *  disable: function(el, rte) {
     *     rte.blur(); // this depends on the Custom RTE API
     *  }
     *
     * // Called when the Text Component is focused again. If you returned the RTE instance
     * // from the enable function, the enable won't be called again instead will call focus,
     * // in this case to avoid double binding of the editor
     *  focus: function (el, rte) {
     *   rte.focus(); // this depends on the Custom RTE API
     *  }
     * });
     */
    setCustomRte(obj) {
      this.RichTextEditor.customRte = obj;
    },

    /**
     * Attach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    on(event, callback) {
      return em.on(event, callback);
    },

    /**
     * Detach event
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    off(event, callback) {
      return em.off(event, callback);
    },

    /**
     * Trigger event
     * @param  {string} event Event to trigger
     * @return {this}
     */
    trigger(event) {
      return em.trigger(event);
    },

    /**
     * Returns editor element
     * @return {HTMLElement}
     * @private
     */
    getEl() {
      return editorView.el;
    },

    /**
     * Returns editor model
     * @return {Model}
     * @private
     */
    getModel() {
      return em;
    },

    /**
     * Render editor
     * @return {HTMLElement}
     */
    render() {
      // Do post render stuff after the iframe is loaded otherwise it'll
      // be empty during tests
      em.on('loaded', () => {
        em.get('modules').forEach((module) => {
          module.postRender && module.postRender(editorView);
        });
      });

      editorView.render();
      return editorView.el;
    },

  };

};
