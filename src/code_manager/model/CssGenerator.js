var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  initialize() {
    this.compCls = [];
  },

  /**
   * Get CSS from component
   * 从组件获取CSS
   * @param {Model} model
   * @return {String}
   */
  buildFromModel(model, opts = {}) {
    var code = '';
    var style = model.get('style');
    var classes = model.get('classes');
    const wrappesIsBody = opts.wrappesIsBody;

    // Let's know what classes I've found
    if(classes) {
      classes.each(function(model){
        this.compCls.push(model.get('name'));
      }, this);
    }

    if(style && Object.keys(style).length !== 0) {
      let selector = `#${model.getId()}`;
      selector = wrappesIsBody && model.get('wrapper') ?
        'body' : selector;
      code += `${selector}{`;
      for(var prop in style){
        if(style.hasOwnProperty(prop))
          code += prop + ':' + style[prop] + ';';
      }
      code += '}';
    }

    return code;
  },

  /**
   * Get CSS from components
   * 从组件获取CSS
   * @param {Model} model
   * @return {String}
   */
  buildFromComp(model) {
    var coll = model.get('components') || model,
      code = '';

    coll.each(function(m) {
      var cln = m.get('components');
      code += this.buildFromModel(m);

      if(cln.length){
        code += this.buildFromComp(cln);
      }

    }, this);

    return code;
  },

  /** @inheritdoc */
  build(model, opts = {}) {
    const cssc = opts.cssc;
    this.compCls = [];
    var code = this.buildFromModel(model, opts);
    code += this.buildFromComp(model);
    var compCls = this.compCls;

    if (cssc) {
      var rules = cssc.getAll();
      var mediaRules = {};
      rules.each(function(rule) {
        var width = rule.get('mediaText');

        // If width setted will render it later
        if(width){
          var mRule = mediaRules[width];
          if(mRule)
            mRule.push(rule);
          else
            mediaRules[width] = [rule];
          return;
        }

        code += this.buildFromRule(rule);
      }, this);

      // Get media rules
      for (var ruleW in mediaRules) {
        var meRules = mediaRules[ruleW];
        var ruleC = '';
        for(var i = 0, len = meRules.length; i < len; i++){
          ruleC += this.buildFromRule(meRules[i]);
        }

        if (ruleC) {
          code += '@media ' + ruleW + '{' + ruleC + '}';
        }
      }

    }
    return code;
  },

  /**
   * Get CSS from the rule model
   * 从规则模型中获取CSS
   * @param {Model} rule
   * @return {string} CSS string
   */
  buildFromRule(rule) {
    var result = '';
    var selectorsAdd = rule.get('selectorsAdd');
    var selectors = rule.get('selectors');
    var ruleStyle = rule.get('style');
    var state = rule.get('state');
    var strSel = '';
    var found = 0;
    var compCls = this.compCls;

    // Get string of selectors
    // 获取选择器字符串
    selectors.each(selector => {
      strSel += '.' + selector.get('name');
      if(compCls.indexOf(selector.get('name')) > -1)
        found = 1;
    });

    // With 'found' will skip rules which selectors are not found in
    // 用“查找”将跳过规则，其中找不到选择器。
    // canvas components.
    // 画布组件。
    if ((strSel && found) || selectorsAdd) {
      strSel += state ? ':' + state : '';
      strSel += selectorsAdd ? (strSel ? ', ' : '') + selectorsAdd : '';
      var strStyle = '';

      // Get string of style properties
      // 获取样式属性字符串
      if(ruleStyle && Object.keys(ruleStyle).length !== 0){
        for(var prop2 in ruleStyle){
          if(ruleStyle.hasOwnProperty(prop2))
            strStyle += prop2 + ':' + ruleStyle[prop2] + ';';
        }
      }

      if(strStyle)
        result += strSel + '{' + strStyle + '}';
    }

    return result;
  },

});
