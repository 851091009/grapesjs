/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 *
 * Selectors in GrapesJS are used in CSS Composer inside Rules and in Components as classes. To get better this concept let's take
 * a look at this code:
 * GrapesJS中的选择器在“规则”和“组件”中的CSS Composer中用作类。 要更好的这个概念，我们来吧
 * 看看这段代码：
 * ```css
 * span > #send-btn.btn{
 *  ...
 * }
 * ```
 * ```html
 * <span>
 *   <button id="send-btn" class="btn"></button>
 * </span>
 * ```
 *
 * In this scenario we get:
 * 在这种情况下，我们得到：
 * span     -> selector of type `tag`
 * send-btn -> selector of type `id`
 * btn      -> selector of type `class`
 *
 * So, for example, being `btn` the same class entity it'll be easier to refactor and track things.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * 所以，例如，“btn”是同一个类实体，它将更容易重构和跟踪事情。
 *
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，方法如下：
 * ```js
 * var selectorManager = editor.SelectorManager;
 * ```
 *
 * @module SelectorManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.selectors=[]] Default selectors
 * @param {Array<Object>} [config.states=[]] Default states
 * @param {String} [config.label='Classes'] Classes label
 * @param {String} [config.statesLabel='- State -'] The empty state label
 * @return {this}
 * @example
 * ...
 * {
 *  selectors: [
 *    {name:'myselector1'},
 *     ...
 *  ],
 *  states: [{
 *    name: 'hover', label: 'Hover'
 *  },{
 *    name: 'active', label: 'Click'
 *  }],
 *  statesLabel: '- Selecte State -',
 * }
 */
module.exports = config => {
  var c = config || {},
  defaults      = require('./config/config'),
  Selector      = require('./model/Selector'),
  Selectors     = require('./model/Selectors'),
  ClassTagsView = require('./view/ClassTagsView');
  var selectors, selectorTags;

  return {

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'SelectorManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块 使用编辑器的新实例自动调用
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(conf) {
      c = conf || {};

      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      const em = c.em;
      const ppfx = c.pStylePrefix;

      if (ppfx) {
        c.stylePrefix = ppfx + c.stylePrefix;
      }

      selectorTags = new ClassTagsView({
        collection: new Selectors([], {em,config: c}),
        config: c,
      });

      // Global selectors container
      selectors = new Selectors(c.selectors);
      selectors.on('add', (model) =>
        em.trigger('selector:add', model));

      return this;
    },

    /**
     * Add a new selector to collection if it's not already exists. Class type is a default one
     * 如果尚未存在，则将一个新的选择器添加到集合。 类类型是默认类型
     * @param {String} name Selector name
     * @param {Object} opts Selector options
     * @param {String} [opts.label=''] Label for the selector, if it's not provided the label will be the same as the name 标签为选择器，如果没有提供标签将与名称相同
     * @param {String} [opts.type='class'] Type of the selector. At the moment, only 'class' is available 选择器的类型。 目前只有'班'可用
     * @return {Model}
     * @example
     * var selector = selectorManager.add('selectorName');
     * // Same as
     * var selector = selectorManager.add('selectorName', {
     *   type: 'class',
     *   label: 'selectorName'
     * });
     * */
    add(name, opts = {}) {
      if (typeof name == 'object') {
        opts = name;
      } else {
        opts.name = name;
      }

      if (opts.label && !opts.name) {
        opts.name = Selector.escapeName(opts.label);
      }

      const cname = opts.name;
      const selector = cname ? this.get(cname) : selectors.where(opts)[0];

      if (!selector) {
        return selectors.add(opts);
      }

      return selector;
    },

    /**
     * Get the selector by its name
     * 以其名称获取选择器
     * @param {String} name Selector name
     * @return {Model|null}
     * @example
     * var selector = selectorManager.get('selectorName');
     * */
    get(name) {
      return selectors.where({name})[0];
    },

    /**
     * Get all selectors
     * 获取所有选择器
     * @return {Collection}
     * */
    getAll() {
      return selectors;
    },

    /**
     * Render class selectors. If an array of selectors is provided a new instance of the collection will be rendered
     * 渲染类选择器。 如果提供了一组选择器，则将呈现集合的新实例
     * @param {Array<Object>} selectors
     * @return {HTMLElement}
     * @private
     */
    render(selectors) {
      if(selectors){
        var view = new ClassTagsView({
          collection: new Selectors(selectors),
          config: c,
        });
        return view.render().el;
      }else
        return selectorTags.render().el;
    },

  };
};
