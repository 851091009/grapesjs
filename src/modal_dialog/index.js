/**
 * * [open](#open)
 * * [close](#close)
 * * [isOpen](#isopen)
 * * [setTitle](#settitle)
 * * [getTitle](#gettitle)
 * * [setContent](#setcontent)
 * * [getContent](#getcontent)
 *
 * Before using the methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，方法如下：
 * ```js
 * var modal = editor.Modal;
 * ```
 * @module Modal
 */
module.exports = () => {
  var c = {},
  defaults  = require('./config/config'),
  ModalM    = require('./model/Modal'),
  ModalView	= require('./view/ModalView');
  var model, modal;

  return {

  	/**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'Modal',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块 使用编辑器的新实例自动调用
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      model = new ModalM(c);
      modal = new ModalView({
        model,
        config: c,
      });

      return this;
    },

    postRender(editorView) {
      // c.em.config.el || 'body'
      this.render().appendTo(editorView.el);
    },

    /**
     * Open the modal window
     * 打开模态窗口
     * @return {this}
     */
    open() {
      modal.show();
      return this;
    },

    /**
     * Close the modal window
     * 关闭模态窗口
     * @return {this}
     */
    close() {
      modal.hide();
      return this;
    },

    /**
     * Checks if the modal window is open
     * 检查模态窗口是否打开
     * @return {Boolean}
     */
    isOpen() {
      return !!model.get('open');
    },

    /**
     * Set the title to the modal window
     * 将标题设置为模态窗口
     * @param {string} title Title
     * @return {this}
     * @example
     * modal.setTitle('New title');
     */
    setTitle(title) {
      model.set('title', title);
      return this;
    },

    /**
     * Returns the title of the modal window
     * 返回模态窗口的标题
     * @return {string}
     */
    getTitle() {
      return model.get('title');
    },

    /**
     * Set the content of the modal window
     * 设置模态窗口的内容
     * @param {string|HTMLElement} content Content
     * @return {this}
     * @example
     * modal.setContent('<div>Some HTML content</div>');
     */
    setContent(content) {
      model.set('content', ' ');
      model.set('content', content);
      return this;
    },

    /**
     * Get the content of the modal window
     * 获取模态窗口的内容
     * @return {string}
     */
    getContent() {
      return model.get('content');
    },

    /**
     * Returns content element
     * 返回内容元素
     * @return {HTMLElement}
     * @private
     */
    getContentEl() {
      return modal.getContent().get(0);
    },

    /**
     * Returns modal model
     * 返回模态模型
     * @return {Model}
     * @private
     */
    getModel() {
      return model;
    },

    /**
     * Render the modal window
     * 渲染模态窗口
     * @return {HTMLElement}
     * @private
     */
    render() {
      return modal.render().$el;
    }
  };
};
