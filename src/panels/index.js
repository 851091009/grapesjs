/**
 *
 * * [addPanel](#addpanel)
 * * [addButton](#addbutton)
 * * [getButton](#getbutton)
 * * [getPanel](#getpanel)
 * * [getPanels](#getpanels)
 * * [render](#render)
 *
 * This module manages panels and buttons inside the editor.
 * 该模块管理编辑器内的面板和按钮。
 * You can init the editor with all panels and buttons necessary via configuration
 * 您可以通过配置启动所有面板和按钮所需的编辑器
 *
 * ```js
 * var editor = grapesjs.init({
 *   ...
 *  panels: {...} // Check below for the possible properties 检查下面的可能属性
 *   ...
 * });
 * ```
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，方法如下：
 * ```js
 * var panelManager = editor.Panels;
 * ```
 *
 * @module Panels
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible panels 数组可能的面板
 * @example
 * ...
 * panels: {
 *    defaults: [{
 *      id: 'main-toolbar',
 *      buttons: [{
 *        id: 'btn-id',
 *        className: 'some',
 *        attributes: {
 *          title: 'MyTitle'
 *        }
 *      }],
 *     }],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults   = require('./config/config'),
  Panel      = require('./model/Panel'),
  Panels     = require('./model/Panels'),
  PanelView  = require('./view/PanelView'),
  PanelsView = require('./view/PanelsView');
  var panels, PanelsViewObj;

  return {

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'Panels',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块 使用编辑器的新实例自动调用
     * @param {Object} config Configurations
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

      panels = new Panels(c.defaults);
      PanelsViewObj = new PanelsView({
        collection : panels,
        config : c,
      });
      return this;
    },

    /**
     * Returns the collection of panels
     * 返回面板的集合。
     * @return {Collection} Collection of panel
     */
    getPanels() {
      return panels;
    },

    /**
     * Returns panels element
     * 返回面板文本
     * @return {HTMLElement}
     */
    getPanelsEl() {
      return PanelsViewObj.el;
    },

    /**
     * Add new panel to the collection
     * 向集合中添加新面板
     * @param {Object|Panel} panel Object with right properties or an instance of Panel 具有正确属性或面板实例的
     * @return {Panel} Added panel. Useful in case passed argument was an Object 添加面板。在传递的参数中有用是一个对象
     * @example
     * var newPanel = panelManager.addPanel({
     *   id: 'myNewPanel',
     *  visible  : true,
     *  buttons  : [...],
     * });
     */
    addPanel(panel) {
      return panels.add(panel);
    },

    /**
     * Get panel by ID 
     * 按ID获取面板
     * @param  {string} id Id string
     * @return {Panel|null}
     * @example
     * var myPanel = panelManager.getPanel('myNewPanel');
     */
    getPanel(id) {
      var res  = panels.where({id});
      return res.length ? res[0] : null;
    },

    /**
     * Add button to the panel
     * 向面板添加按钮
     * @param {string} panelId Panel's ID
     * @param {Object|Button} button Button object or instance of Button 按钮对象或按钮实例
     * @return {Button|null} Added button. Useful in case passed button was an Object 添加的按钮。用例按钮是一个有用的对象
     * @example
     * var newButton = panelManager.addButton('myNewPanel',{
     *   id: 'myNewButton',
     *   className: 'someClass',
     *   command: 'someCommand',
     *   attributes: { title: 'Some title'},
     *   active: false,
     * });
     * // It's also possible to pass the command as an object
     * // with .run and .stop methods
     * ...
     * command: {
     *   run: function(editor) {
     *     ...
     *   },
     *   stop: function(editor) {
     *     ...
     *   }
     * },
     * // Or simply like a function which will be evaluated as a single .run command
     * // 或者简单地像一个函数，它将作为一个单独的运行命令进行评估。
     * ...
     * command: function(editor) {
     *   ...
     * }
     */
    addButton(panelId, button) {
      var pn  = this.getPanel(panelId);
      return pn ? pn.get('buttons').add(button) : null;
    },

    /**
     * Get button from the panel
     * 从面板获取按钮
     * @param {string} panelId Panel's ID
     * @param {string} id Button's ID
     * @return {Button|null}
     * @example
     * var button = panelManager.getButton('myPanel','myButton');
     */
    getButton(panelId, id) {
      var pn  = this.getPanel(panelId);
      if(pn){
        var res  = pn.get('buttons').where({id});
        return res.length ? res[0] : null;
      }
      return null;
    },

    /**
     * Render panels and buttons
     * 渲染面板和按钮
     * @return {HTMLElement}
     */
    render() {
      return PanelsViewObj.render().el;
    },

    /**
     * Active activable buttons
     * 主动激活的按钮
     * @private
     */
    active() {
      this.getPanels().each(p => {
          p.get('buttons').each(btn => {
            if(btn.get('active'))
              btn.trigger('updateActive');
          });
        });
    },

    Panel,

  };
};
