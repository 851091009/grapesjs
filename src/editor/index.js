/**
 * 编辑器的函数
 * * [getConfig](#getconfig)
 * * [getHtml](#gethtml) - 获取html
 * * [getCss](#getcss)
 * * [getJs](#getjs)
 * * [getComponents](#getcomponents) 获取组件
 * * [setComponents](#setcomponents) 设置组件
 * * [addComponents](#addcomponents) 添加组件
 * * [getStyle](#getstyle)           获取样式
 * * [setStyle](#setstyle)           设置样式
 * * [getSelected](#getselected)     获取选择器 
 * * [getSelectedToStyle](#getselectedtostyle) 获得选择到风格
 * * [setDevice](#setdevice) 设置设备
 * * [getDevice](#getdevice) 获取设备
 * * [runCommand](#runcommand) 运行命令
 * * [stopCommand](#stopcommand) 停止命令
 * * [store](#store) 商店
 * * [load](#load)   加载
 * * [getContainer](#getcontainer) 得到容器
 * * [refresh](#refresh) 刷新
 * * [on](#on)
 * * [off](#off)
 * * [trigger](#trigger) 触发
 * * [render](#render)   显示模板
 *
 * Editor class contains the top level API which you'll probably use to custom the editor or extend it with plugins. 
 * 编辑器类包含顶级API，您可能会使用它来定制编辑器或用插件扩展它。
 * You get the Editor instance on init method
 * 获取init方法的编辑器实例
 * ```js
 * var editor = grapesjs.init({...});
 * ```
 *
 * **Available Events** 可用事件
 * * `component:add` - Triggered when a new component is added to the editor, the model is passed as an argument to the callback 当将新组件添加到编辑器时，该模型将作为参数传递给回调。
 * * `component:update` - Triggered when a component is, generally, updated (moved, styled, etc.) 当组件是更新的（移动、样式等）时触发的。
 * * `component:update:{propertyName}` - Listen any property change                       监听任何属性改变
 * * `component:styleUpdate` - Triggered when the style of the component is updated       当组件的样式被更新时触发。
 * * `component:styleUpdate:{propertyName}` - Listen for a specific style property change 监听特定样式属性更改。
 * *  asset 暂时理解为图片管理器
 * * `asset:add`    - New asset added  新的资产增值
 * * `asset:remove` - Asset removed 资产删除
 * * `asset:upload:start` - Before the upload is started   在上传开始之前
 * * `asset:upload:end`   - After the upload is ended      上传结束后
 * * `asset:upload:error` - On any error in upload, passes the error as an argument 上载时的任何错误，都会将该错误作为参数传递。
 * * `asset:upload:response` - On upload response, passes the result as an argument 在上载响应上，将结果作为参数传递。
 * * `styleManager:change` - Triggered on style property change from new selected component, the view of the property is passed as an argument to the callback 
 * *  在新选定组件的样式属性更改触发时，属性视图作为回调参数传递给回调。
 * * `styleManager:change:{propertyName}` - As above but for a specific style property                          如上所述，但对于具体的风格属性
 * * `storage:load` - Triggered when something was loaded from the storage, loaded object passed as an argumnet 触发时，有东西从存储加载，加载对象传递一个argumnet
 * * `storage:store` - Triggered when something is stored to the storage, stored object passed as an argumnet   触发时，一些存储在存储，存储的对象传递一个argumnet
 * * `selector:add` - Triggers when a new selector/class is created 当创建一个新的选择器/类时触发。
 * * `canvasScroll` - Triggered when the canvas is scrolled         触发时，画布上滚动
 * * `run:{commandName}` - Triggered when some command is called to run (eg. editor.runCommand('preview'))    触发时，一些命令来运行（如编辑。RunCommand（'preview '））
 * * `stop:{commandName}` - Triggered when some command is called to stop (eg. editor.stopCommand('preview')) 触发时，一些命令来停止（如编辑。stopcommand（'preview '））
 * * `load` - When the editor is loaded 当编辑器加载时
 *
 * @module Editor 编辑器配置
 * @param {Object} config Configurations 配置
 * @param {string} config.container='' Selector for the editor container, eg. '#myEditor'   编辑器容器的选择器
 * @param {string|Array<Object>} [config.components=''] HTML string or object of components HTML字符串或组件对象
 * @param {string|Array<Object>} [config.style=''] CSS string or object of rules            CSS字符串或规则对象
 * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container 如果为true，将从选定容器中获取HTML和CSS。
 * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components 启用/禁用复制（Ctrl + C）和粘贴（Ctrl + V）组件的可能性
 * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager   启用/禁用撤消管理器
 * @param {Boolean} [config.autorender=true] If true renders editor on init 如果TRUE在init上呈现编辑器
 * @param {Boolean} [config.noticeOnUnload=true] Enable/Disable alert message before unload the page 在卸载页面之前启用/禁用警报消息
 * @param {string} [config.height='900px'] Height for the editor container 编辑器容器的高度
 * @param {string} [config.width='100%'] Width for the editor container    编辑器容器的宽度
 * @param {Object} [config.storage={}] Storage manager configuration, see the relative documentation    存储管理器配置，请参见相关文档
 * @param {Object} [config.styleManager={}] Style manager configuration, see the relative documentation 样式管理器配置，请参见相关文档
 * @param {Object} [config.commands={}] Commands configuration, see the relative documentation        命令配置，请参见相关文档
 * @param {Object} [config.domComponents={}] Components configuration, see the relative documentation 组件配置，请参见相关文档
 * @param {Object} [config.panels={}] Panels configuration, see the relative documentation            面板配置，请参见相关文档
 * @param {Object} [config.showDevices=true] If true render a select of available devices inside style manager panel 如果为真，在样式管理面板中显示可用设备的选择
 * @param {string} [config.defaultCommand='select-comp'] Command to execute when no other command is running         命令在没有其他命令运行时执行
 * @param {Array}  [config.plugins=[]] Array of plugins to execute on start 开始执行的插件数组
 * @param {Object} [config.pluginsOpts={}] Custom options for plugins      插件的自定义选项
 * @example
 * var editor = grapesjs.init({
 *   container : '#gjs',
 *   components: '<div class="txt-red">Hello world!</div>',
 *   style: '.txt-red{color: red}',
 * });
 */

module.exports = config => {
  var c = config || {}, // 用来存储 配置文件
  defaults    = require('./config/config'),
  EditorModel = require('./model/Editor'),
  EditorView  = require('./view/EditorView');
  // 配置默认属性
  for (var name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  // style 的前缀
  c.pStylePrefix = c.stylePrefix;
  // em 是 EditorModel
  var em = new EditorModel(c);
  // editorView 这个很重要，里面有所有的方法控制器的方法
  var editorView = new EditorView({
      model: em,
      config: c, 
  });

  return {

    /**
     * @property {EditorModel}
     * @private
     * em 是编辑的模型，里面有编辑器的方法
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
     * 初始化编辑模型
     * @return {this}
     * @private
     */
    init() {
      em.init(this); // 调用 editor model 的init 方法
      return this;
    },

    /**
     * Returns configuration object
     * 返回配置对象
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Returns HTML built inside canvas
     * 返回内置在画布中的HTML
     * @return {string} HTML string
     */
    getHtml() {
      return em.getHtml();
    },

    /**
     * Returns CSS built inside canvas
     * 返回CSS内置在画布
     * @return {string} CSS string
     */
    getCss() {
      return em.getCss();
    },

    /**
     * Returns JS of all components
     * 返回所有组件的 js
     * @return {string} JS string
     */
    getJs() {
      return em.getJs();
    },

    /**
     * Returns components in JSON format object
     * 返回JSON格式对象中的组件
     * @return {Object}
     */
    getComponents() {
      return em.get('DomComponents').getComponents();
    },

    /**
     * Set components inside editor's canvas. This method overrides actual components
     * 在编辑器的画布中设置组件。此方法覆盖实际组件。
     * @param {Array<Object>|Object|string} components HTML string or components model HTML字符串或组件模型
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
     * 添加组件
     * @param {Array<Object>|Object|string} components HTML string or components model HTML字符串或组件模型
     * @param {Object} opts Options
     * @param {Boolean} [opts.avoidUpdateStyle=false] If the HTML string contains styles, 如果HTML字符串包含样式，
     * by default, they will be created and, if already exist, updated. When this option
     * is true, styles already created will not be updated.
     * 默认情况下，它们将被创建，如果已经存在，则会被更新。 当这个选项
     * 是真的，已经创建的样式将不会被更新。
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
     * 以JSON格式对象返回样式
     * @return {Object}
     */
    getStyle() {
      return em.get('CssComposer').getAll();
    },

    /**
     * Set style inside editor's canvas. This method overrides actual style
     * 在编辑器的画布中设置样式。此方法重写实际样式。
     * @param {Array<Object>|Object|string} style CSS string or style model CSS字符串或样式模型
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
     * 返回选定的组件，如果有
     * @return {Model}
     */
    getSelected() {
      return em.getSelected();
    },

    /**
     * Get a stylable entity from the selected component.                      从选定的元件可设置样式的实体。
     * If you select a component without classes the entity is the Component   如果您选择一个没有类的组件，那么实体就是组件
     * itself and all changes will go inside its 'style' attribute. Otherwise, 本身和所有的变化将进入它的“样式”属性。否则，
     * if the selected component has one or more classes, the function will    如果所选组件有一个或多个类，则函数将
     * return the corresponding CSS Rule 返回相应的CSS规则
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
     * 选择一个组件
     * @param  {Component|HTMLElement} el Component to select 要选择的组件
     * @return {this}
     * @example
     * // Select dropped block 选择掉块
     * editor.on('block:drag:stop', function(model) {
     *  editor.select(model);
     * });
     */
    select(el) {
      em.setSelected(el);
      return this;
    },

    /**
     * Set device to the editor. If the device exists it will 将设备设置为编辑器。如果设备存在，它将
     * change the canvas to the proper width   将画布改为适当的宽度
     * @param {string} name Name of the device 设备名称
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
     * 返回实际活动设备
     * @return {string} Device name 设备名称
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
     * 执行命令
     * @param {string} id Command ID  命令ID
     * @param {Object} options Custom options 自定义选项
     * @return {*} The return is defined by the command 返回由命令定义
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
     * 如果提供停止方法，停止命令
     * @param {string} id Command ID 命令ID
     * @param {Object} options Custom options  自定义选项
     * @return {*} The return is defined by the command 返回由命令定义
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
     * 将数据存储到当前存储
     * @param {Function} clb Callback function 回调函数
     * @return {Object} Stored data 存储数据
     */
    store(clb) {
      return em.store(clb);
    },

    /**
     * Load data from the current storage
     * 从当前存储中加载数据
     * @param {Function} clb Callback function
     * @return {Object} Stored data
     */
    load(clb) {
      return em.load(clb);
    },

    /**
     * Returns container element. The one which was indicated as 'container'
     * 返回容器元素。那个被指明为“容器”的
     * on init method
     * @return {HTMLElement}
     */
    getContainer() {
      return c.el;
    },

    /**
     * Update editor dimensions and refresh data useful for positioning of tools 更新编辑器的维度和刷新数据，用于工具的定位
     *
     * This method could be useful when you update, for example, some position  当您更新某个位置时，此方法可能非常有用。
     * of the editor element (eg. canvas, panels, etc.) with CSS, where without 编辑器元素（如画布、面板等）与CSS，在没有
     * refresh you'll get misleading position of tools (eg. rich text editor,   刷新您将得到工具的误导位置（例如富文本编辑器），
     * component highlighter, etc.) 组件荧光笔等）
     *
     * @private
     */
    refresh() {
      em.refreshCanvas();
    },

    /**
     * Replace the built-in Rich Text Editor with a custom one. 用自定义的编辑器替换内置的富文本编辑器。
     * @param {Object} obj Custom RTE Interface
     * @example
     * editor.setCustomRte({
     *   // Function for enabling custom RTE
     *   // el is the HTMLElement of the double clicked Text Component
     *   // rte is the same instance you have returned the first time you call
     *   // enable(). This is useful if need to check if the RTE is already enabled so
     *   // ion this case you'll need to return the RTE and the end of the function
     *   
     *   // 启用自定义RTE的功能
     *   // el是双击文本组件的HTMLElement
     *   // rte是你第一次打电话时返回的同一个实例
     *   // enable（）。 如果需要检查RTE是否已经启用，这很有用
     *这个例子你需要返回RTE和函数的结尾
     *   enable: function(el, rte) {
     *     rte = new MyCustomRte(el, {}); // this depends on the Custom RTE API
     *     ...
     *     return rte; // return the RTE instance
     *   },
     *
     *   // Disable the editor, called for example when you unfocus the Text Component
     *   // 禁用编辑器，例如当您对文本组件进行聚焦时
     *  disable: function(el, rte) {
     *     rte.blur(); // this depends on the Custom RTE API
     *  }
     *
     * // Called when the Text Component is focused again. If you returned the RTE instance
     * // from the enable function, the enable won't be called again instead will call focus,
     * // in this case to avoid double binding of the editor
     * 
     *  // 当文本组件再次聚焦时调用。 如果您返回了RTE实例
     *  // 从启用功能，启用不会再次调用，而是调用焦点，
     *  // 在这种情况下，以避免编辑器的双重绑定
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
     * 附加事件
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    on(event, callback) {
      return em.on(event, callback);
    },

    /**
     * Detach event
     * 分离事件
     * @param  {string} event Event name
     * @param  {Function} callback Callback function
     * @return {this}
     */
    off(event, callback) {
      return em.off(event, callback);
    },

    /**
     * Trigger event
     * 触发事件.
     * @param  {string} event Event to trigger 事件触发
     * @return {this}
     */
    trigger(event) {
      return em.trigger(event);
    },

    /**
     * Returns editor element
     * 返回编辑元素
     * @return {HTMLElement}
     * @private
     */
    getEl() {
      return editorView.el;
    },

    /**
     * Returns editor model
     * 返回编辑模式
     * @return {Model}
     * @private
     */
    getModel() {
      return em;
    },

    /**
     * Render editor
     * 渲染编辑器
     * @return {HTMLElement}
     */
    render() {
      // Do post render stuff after the iframe is loaded otherwise it'll
      // 做渲染后的东西后，iframe加载否则会
      // be empty during tests
      // 测试期间空
      // index.html 调用的是这个
      console.log(em.get('modules'));
      // em.get('modules')： 是所有的加载的文件
      // loaded: 当所有DOM解析完以后会触发这个事件
      em.on('loaded', () => {
        em.get('modules').forEach((module) => {
          module.postRender && module.postRender(editorView); // 执行扩展文件里面的  postRender 方法
        });
      });

      editorView.render();
      return editorView.el;
    },

  };

};
