/**
 * - [addGenerator](#addgenerator)
 * - [getGenerator](#getgenerator)
 * - [getGenerators](#getgenerators)
 * - [addViewer](#addviewer)
 * - [getViewer](#getviewer)
 * - [getViewers](#getviewers)
 * - [updateViewer](#updateviewer)
 * - [getCode](#getcode)
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 *
 * ```js
 * var codeManager = editor.CodeManager;
 * ```
 *
 * @module CodeManager
 */
module.exports = () => {

  var c = {},
  defaults = require('./config/config'),
  gHtml    = require('./model/HtmlGenerator'),
  gCss     = require('./model/CssGenerator'),
  gJson    = require('./model/JsonGenerator'),
  gJs      = require('./model/JsGenerator'),
  eCM      = require('./model/CodeMirrorEditor'),
  editorView = require('./view/EditorView');

  var generators = {},
  defGenerators  = {},
  viewers = {},
  defViewers = {};

  return {

    getConfig() {
      return c;
    },

    config: c,

    EditorView: editorView,

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'CodeManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块。使用编辑器的新实例自动调用
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

      defGenerators.html = new gHtml();
      defGenerators.css  = new gCss();
      defGenerators.json = new gJson();
      defGenerators.js = new gJs();

      defViewers.CodeMirror = new eCM();
      return this;
    },

    /**
     * Callback on load
     * 回调负荷
     */
    onLoad() {
      this.loadDefaultGenerators().loadDefaultViewers();
    },

    /**
     * Add new code generator to the collection
     * 向集合中添加新的代码生成器
     * @param  {string} id Code generator ID
     * @param  {Object} generator Code generator wrapper
     * @param {Function} generator.build Function that builds the code
     * @return {this}
     * @example
     * codeManager.addGenerator('html7',{
     *   build: function(model){
     *    return 'myCode';
     *   }
     * });
     * */
    addGenerator(id, generator) {
      generators[id] = generator;
      return this;
    },

    /**
     * Get code generator by id
     * 按ID获取代码生成器
     * @param  {string} id Code generator ID
     * @return {Object|null}
     * @example
     * var generator = codeManager.getGenerator('html7');
     * generator.build = function(model){
     *   //extend
     * };
     * */
    getGenerator(id) {
      return generators[id] || null;
    },

    /**
     * Returns all code generators
     * 返回所有代码生成器
     * @return {Array<Object>}
     * */
    getGenerators() {
      return generators;
    },

    /**
     * Add new code viewer
     * 添加新代码查看器
     * @param  {string} id Code viewer ID
     * @param  {Object} viewer Code viewer wrapper
     * @param {Function} viewer.init Set element on which viewer will be displayed
     * @param {Function} viewer.setContent Set content to the viewer
     * @return {this}
     * @example
     * codeManager.addViewer('ace',{
     *   init: function(el){
     *     var ace = require('ace-editor');
     *     this.editor  = ace.edit(el.id);
     *   },
     *   setContent: function(code){
     *    this.editor.setValue(code);
     *   }
     * });
     * */
    addViewer(id, viewer) {
      viewers[id] = viewer;
      return this;
    },

    /**
     * Get code viewer by id
     * 按ID获取代码查看器
     * @param  {string} id Code viewer ID
     * @return {Object|null}
     * @example
     * var viewer = codeManager.getViewer('ace');
     * */
    getViewer(id) {
      return viewers[id] || null;
    },

    /**
     * Returns all code viewers
     * 返回所有代码查看器
     * @return {Array<Object>}
     * */
    getViewers() {
      return viewers;
    },

    /**
     * Update code viewer content
     * 更新代码查看器内容
     * @param  {Object} viewer Viewer instance
     * @param  {string} code  Code string
     * @example
     * var AceViewer = codeManager.getViewer('ace');
     * // ...
     * var viewer = AceViewer.init(el);
     * // ...
     * codeManager.updateViewer(AceViewer, 'code');
     * */
    updateViewer(viewer, code) {
      viewer.setContent(code);
    },

    /**
     * Get code from model
     * 从模型中获取代码
     * @param  {Object} model Any kind of model that will be passed to the build method of generator
     * @param  {string} genId Code generator id
     * @param  {Object} [opt] Options
     * @return {string}
     * @example
     * var codeStr = codeManager.getCode(model, 'html');
     * */
    getCode(model, genId, opt = {}) {
      var generator  = this.getGenerator(genId);
      return generator ? generator.build(model, opt) : '';
    },

    /**
     * Load default code generators
     * 加载默认代码生成器
     * @return {this}
     * @private
     * */
    loadDefaultGenerators() {
      for (var id in defGenerators)
        this.addGenerator(id, defGenerators[id]);

      return this;
    },

    /**
     * Load default code viewers
     * 加载默认代码查看器
     * @return {this}
     * @private
     * */
    loadDefaultViewers() {
      for (var id in defViewers)
        this.addViewer(id, defViewers[id]);

      return this;
    },

  };

};
