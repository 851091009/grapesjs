/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [load](#load)
 * * [store](#store)
 *
 * This module contains and manage CSS rules for the template inside the canvas
 * 此模块包含和管理CSS模板内的CSS规则。
 * Before using the methods you should get first the module from the editor instance, in this way:
 * 在使用这些方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 *
 * ```js
 * var cssComposer = editor.CssComposer;
 * ```
 *
 * @module CssComposer
 * @param {Object} config Configurations
 * @param {string|Array<Object>} [config.rules=[]] CSS string or an array of rule objects
 * @example
 * ...
 * CssComposer: {
 *    rules: '.myClass{ color: red}',
 * }
 */

module.exports = () => {
  var c = {},
  defaults     = require('./config/config'),
  CssRule      = require('./model/CssRule'),
  CssRules     = require('./model/CssRules'),
  Selectors    = require('./model/Selectors'),
  CssRulesView = require('./view/CssRulesView');

  var rules, rulesView;

  return {

      Selectors,

      /**
       * Name of the module
       * 模块名称
       * @type {String}
       * @private
       */
      name: 'CssComposer',

      /**
       * Mandatory for the storage manager
       * 存储管理器的强制性
       * @type {String}
       * @private
       */
      storageKey() {
        var keys = [];
        var smc = (c.stm && c.stm.getConfig()) || {};
        if(smc.storeCss)
          keys.push('css');
        if(smc.storeStyles)
          keys.push('styles');
        return keys;
      },

      /**
       * Initializes module. Automatically called with a new instance of the editor
       * 初始化模块。使用编辑器的新实例自动调用
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

        var elStyle = (c.em && c.em.config.style) || '';
        c.rules = elStyle || c.rules;

        c.sm = c.em; // TODO Refactor
        rules = new CssRules([], c);
        rules.add(c.rules);

        rulesView = new CssRulesView({
          collection: rules,
          config: c,
        });
        return this;
      },

      /**
       * On load callback
       * @private
       */
      onLoad() {
        if(c.stm && c.stm.isAutosave())
          c.em.listenRules(this.getAll());
      },

      /**
       * Load data from the passed object, if the object is empty will try to fetch them
       * 从已传递对象加载数据，如果对象为空，将尝试获取它们。
       * autonomously from the storage manager.
       * 从存储管理器自主地。
       * The fetched data will be added to the collection
       * 获取的数据将被添加到集合中。
       * @param {Object} data Object of data to load 加载数据对象
       * @return {Object} Loaded rules
       */
      load(data) {
        var d = data || '';
        if(!d && c.stm)
          d = c.em.getCacheLoad();
        var obj = '';
        if(d.styles) {
          try{
            obj =  JSON.parse(d.styles);
          }catch(err){}
        } else if (d.css) {
          obj = c.em.get('Parser').parseCss(d.css);
        }

        if(obj)
          rules.reset(obj);
        return obj;
      },

      /**
       * Store data to the selected storage
       * 将数据存储到选定的存储区
       * @param {Boolean} noStore If true, won't store
       * @return {Object} Data to store
       */
      store(noStore) {
        if(!c.stm)
          return;
        var obj = {};
        var keys = this.storageKey();
        if(keys.indexOf('css') >= 0)
          obj.css = c.em.getCss();
        if(keys.indexOf('styles') >= 0)
          obj.styles = JSON.stringify(rules);
        if(!noStore)
          c.stm.store(obj);
        return obj;
      },

      /**
       * Add new rule to the collection, if not yet exists with the same selectors
       * 如果集合中没有相同的选择器，则向集合中添加新规则
       * @param {Array<Selector>} selectors Array of selectors
       * @param {String} state Css rule state
       * @param {String} width For which device this style is oriented
       * @param {Object} opts Other options for the rule
       * @return {Model}
       * @example
       * var sm = editor.SelectorManager;
       * var sel1 = sm.add('myClass1');
       * var sel2 = sm.add('myClass2');
       * var rule = cssComposer.add([sel1, sel2], 'hover');
       * rule.set('style', {
       *   width: '100px',
       *   color: '#fff',
       * });
       * */
      add(selectors, state, width, opts) {
        var s = state || '';
        var w = width || '';
        var opt = opts || {};
        var rule = this.get(selectors, s, w, opt);
        if(rule)
          return rule;
        else {
          opt.state = s;
          opt.mediaText = w;
          opt.selectors = '';
          rule = new CssRule(opt);
          rule.get('selectors').add(selectors);
          rules.add(rule);
          return rule;
        }
      },

      /**
       * Get the rule
       * 得到的规则
       * @param {Array<Selector>} selectors Array of selectors
       * @param {String} state Css rule state
       * @param {String} width For which device this style is oriented
       * @param {Object} ruleProps Other rule props
       * @return  {Model|null}
       * @example
       * var sm = editor.SelectorManager;
       * var sel1 = sm.add('myClass1');
       * var sel2 = sm.add('myClass2');
       * var rule = cssComposer.get([sel1, sel2], 'hover');
       * // Update the style
       * rule.set('style', {
       *   width: '300px',
       *   color: '#000',
       * });
       * */
      get(selectors, state, width, ruleProps) {
        var rule = null;
        rules.each(m => {
          if(rule)
            return;
          if(m.compare(selectors, state, width, ruleProps))
            rule = m;
        });
        return rule;
      },

      /**
       * Get the collection of rules
       * 获得规则的集合
       * @return {Collection}
       * */
      getAll() {
        return rules;
      },

      /**
       * Add a raw collection of rule objects
       * 添加规则对象的原始集合
       * This method overrides styles, in case, of already defined rule
       * 此方法重写样式，以防已经定义的规则。
       * @param {Array<Object>} data Array of rule objects, eg . [{selectors: ['class1'], style: {....}}, ..]
       * @param {Object} opts Options
       * @return {Array<Model>}
       * @private
       */
      addCollection(data, opts = {}) {
        var result = [];
        var d = data instanceof Array ? data : [data];

        for (var i = 0, l = d.length; i < l; i++) {
          var rule = d[i] || {};
          if(!rule.selectors)
            continue;
          var sm = c.em && c.em.get('SelectorManager');
          if(!sm)
            console.warn('Selector Manager not found');
          var sl = rule.selectors;
          var sels = sl instanceof Array ? sl : [sl];
          var newSels = [];

          for (var j = 0, le = sels.length; j < le; j++) {
            var selec = sm.add(sels[j]);
            newSels.push(selec);
          }

          var modelExists = this.get(newSels, rule.state, rule.mediaText, rule);
          var model = this.add(newSels, rule.state, rule.mediaText, rule);
          var updateStyle = !modelExists || !opts.avoidUpdateStyle;
          const style = rule.style || {};

          if (updateStyle) {
            let styleUpdate = opts.extend ?
              Object.assign({}, model.get('style'), style) : style;
            model.set('style', styleUpdate);
          }

          result.push(model);
        }

        return result;
      },

      /**
       * Render the block of CSS rules
       * 渲染CSS规则的块
       * @return {HTMLElement}
       * @private
       */
      render() {
        return rulesView.render().el;
      }

    };
};
