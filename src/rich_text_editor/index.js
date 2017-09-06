/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 *
 * This module allows to customize the toolbar of the Rich Text Editor and use commands from the HTML Editing APIs.
 * For more info about HTML Editing APIs check here:
 * 该模块允许自定义富文本编辑器的工具栏，并使用HTML编辑API中的命令。
 * 有关HTML编辑API的更多信息，请访问：
 * https://developer.mozilla.org/it/docs/Web/API/Document/execCommand
 *
 * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize')
 * and leave this task to the Style Manager.
 * 强烈建议保持此工具栏的尽可能小，特别是从样式命令（例如'fontSize'）
 * 并将此任务留给风格经理。
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，方法如下：
 * ```js
 * var rte = editor.RichTextEditor;
 * ```
 * Complete list of commands
 * 完整的命令列表
 * https://developer.mozilla.org/it/docs/Web/API/Document/execCommand
 * http://www.quirksmode.org/dom/execCommand.html
 * @module RichTextEditor
 */
module.exports = () => {
  var c = {},
  defaults = require('./config/config'),
  rte = require('./view/TextEditorView'),
  CommandButtons = require('./model/CommandButtons'),
  CommandButtonsView = require('./view/CommandButtonsView');
  var tlbPfx, toolbar, commands;
  var mainSelf;

  return {

    customRte: null,

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'rte',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块 使用编辑器的新实例自动调用
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      mainSelf = this;
      c = config || {};
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      tlbPfx = c.stylePrefix;
      commands = new CommandButtons(c.commands);
      toolbar = new CommandButtonsView({
        collection: commands,
        config: c,
      });
      return this;
    },

    /**
     * Add a new command to the toolbar
     * 向工具栏添加新命令
     * @param {string} command Command name
     * @param {Object} opts Command options
     * @return {Model} Added command
     * @example
     * var cm = rte.add('bold', {
     *   title: 'Make bold',
     *   class: 'fa fa-bold',
     * });
     * // With arguments
     * var cm = rte.add('fontSize', {
     *   title: 'Font size',
     *   options: [
     *     {name: 'Big', value: 5},
     *     {name: 'Normal', value: 3},
     *     {name: 'Small', value: 1}
     *   ]
     * });
     */
    add(command, opts) {
      var obj = opts || {};
      obj.command = command;
      return commands.add(obj);
    },

    /**
     * Get the command by its name
     * 以命名获得命令
     * @param {string} command Command name
     * @return {Model}
     * @example
     * var cm = rte.get('fontSize');
     */
    get(command) {
      return commands.where({command})[0];
    },

    /**
     * Returns the collection of commands
     * 返回命令的集合
     * @return {Collection}
     */
    getAll() {
      return commands;
    },

    /**
     * Triggered when the offset of the editor is changed
     * 当编辑器的偏移改变时触发
     * @private
     */
    udpatePosition() {
      var u = 'px';
      var canvas = c.em.get('Canvas');
      var pos = canvas.getTargetToElementDim(toolbar.el, this.lastEl, {
        event: 'rteToolbarPosUpdate',
      });

      if (c.adjustToolbar) {
        // Move the toolbar down when the top canvas edge is reached
        // 到达顶部画布边缘时，向下移动工具栏
        if (pos.top <= pos.canvasTop) {
          pos.top = pos.elementTop + pos.elementHeight;
        }
      }

      var toolbarStyle = toolbar.el.style;
      toolbarStyle.top = pos.top + u;
      toolbarStyle.left = pos.left + u;
    },

    /**
     * Bind rich text editor to the element
     * 将富文本编辑器绑定到元素
     * @param {View} view 
     * @param {Object} rte The instance of already defined RTE 已经定义的RTE的实例
     * @private
     * */
    attach(view, rte) {
      // lastEl will be used to place the RTE toolbar
      // lastEl将用于放置RTE工具栏
      this.lastEl = view.el;
      var el = view.getChildrenContainer();
      var customRte = this.customRte;

      // If a custom RTE is defined
      // 如果定义了RTE
      if (customRte) {
        rte = customRte.enable(el, rte);
      } else {
        $(el).wysiwyg({}).focus();
      }

      this.show();

      if(c.em) {
        setTimeout(this.udpatePosition.bind(this), 0);
        c.em.off('change:canvasOffset', this.udpatePosition, this);
        c.em.on('change:canvasOffset', this.udpatePosition, this);
        // Update position on scrolling
        // 更新滚动位置
        c.em.off('canvasScroll', this.udpatePosition, this);
        c.em.on('canvasScroll', this.udpatePosition, this);
      }

      // Avoid closing edit mode clicking on toolbar
      // 避免关闭编辑模式点击工具栏
      toolbar.$el.on('mousedown', this.disableProp);
      return rte;
    },

    /**
     * Unbind rich text editor from the element
     * 从元素中取消绑定富文本编辑器
     * @param {View} view
     * @param {Object} rte The instance of already defined RTE 已经定义的RTE的实例
     * @private
     * */
    detach(view, rte) {
      var customRte = this.customRte;
      var el = view.getChildrenContainer();
      if (customRte) {
        view.model.set('content', el.innerHTML);
        customRte.disable(el, rte);
      } else {
        $(el).wysiwyg('destroy');
      }
      this.hide();
      toolbar.$el.off('mousedown', this.disableProp);
    },

    /**
     * Unbind rich text editor from the element
     * 从元素中取消绑定富文本编辑器
     * @param {View} view
     * @param {Object} rte The instance of already defined RTE 已经定义的RTE的实例
     * @private
     * */
    focus(view, rte) {
      var customRte = this.customRte;
      var el = view.getChildrenContainer();
      if (customRte) {
        if(customRte.focus)
          customRte.focus(el, rte);
      } else {
        this.attach(view);
      }
    },

    /**
     * Show the toolbar
     * 显示工具栏
     * @private
     * */
    show() {
      var toolbarStyle = toolbar.el.style;
      toolbarStyle.display = "block";
    },

    /**
     * Hide the toolbar
     * 隐藏工具栏
     * @private
     * */
    hide() {
      toolbar.el.style.display = "none";
    },

    /**
     * Isolate the disable propagation method
     * 隔离禁用传播方法
     * @private
     * */
    disableProp(e) {
      e.stopPropagation();
    },

    /**
     * Return toolbar element
     * 返回工具栏元素
     * @return {HTMLElement}
     * @private
     */
    getToolbarEl() {
      return toolbar.el;
    },

    /**
     * Render toolbar
     * 渲染工具栏
     * @return {HTMLElement}
     * @private
     */
    render() {
      return toolbar.render().el;
    }

  };
};
