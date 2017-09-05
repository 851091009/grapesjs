import Styleable from 'domain_abstract/model/Styleable';

var Backbone  = require('backbone');
var Selectors = require('./Selectors');

module.exports = Backbone.Model.extend(Styleable).extend({

	defaults: {
    // Css selectors
    // CSS选择器
    selectors: {},

    // Additional string css selectors
    // 附加字符串CSS选择器
    selectorsAdd: '',

    // Css properties style
    // CSS属性的风格
    style: {},

    // On which device width this rule should be rendered, eg. @media (max-width: 1000px)
    // 在哪个设备宽度上应该显示这个规则 如. @media (max-width: 1000px)
    mediaText: '',

    // State of the rule, eg: hover | pressed | focused
    // 属性的规则，如：悬停|压|聚焦
    state: '',

    // Indicates if the rule is stylable
    stylable: true,
	},

  initialize(c, opt) {
      this.config = c || {};
      const em = opt && opt.sm;
      let selectors = this.config.selectors || [];
      this.em = em;

      if (em) {
        const sm = em.get('SelectorManager');
        const slct = [];
        selectors.forEach((selector) => {
          slct.push(sm.add(selector));
        });
        selectors = slct;
      }

      this.set('selectors', new Selectors(selectors));
  },

  /**
   * Compare the actual model with parameters
   * 实际模型与参数比较
   * @param   {Object} selectors Collection of selectors
   * @param   {String} state Css rule state
   * @param   {String} width For which device this style is oriented
   * @param {Object} ruleProps Other rule props
   * @return  {Boolean}
   * @private
   */
  compare(selectors, state, width, ruleProps) {
      var otherRule = ruleProps || {};
      var st = state || '';
      var wd = width || '';
      var selectorsAdd = otherRule.selectorsAdd || '';
      var cId = 'cid';
      //var a1 = _.pluck(selectors.models || selectors, cId);
      //var a2 = _.pluck(this.get('selectors').models, cId);
      if(!(selectors instanceof Array) && !selectors.models)
        selectors = [selectors];
      var a1 = _.map((selectors.models || selectors), model => model.get('name'));
      var a2 = _.map(this.get('selectors').models, model => model.get('name'));
      var f = false;

      if(a1.length !== a2.length)
          return f;

      for (var i = 0; i < a1.length; i++) {
          var re = 0;
          for (var j = 0; j < a2.length; j++) {
              if (a1[i] === a2[j])
                  re = 1;
          }
          if(re === 0)
            return f;
      }

      if(this.get('state') !== st)
          return f;

      if(this.get('mediaText') !== wd)
          return f;

      if(this.get('selectorsAdd') !== selectorsAdd)
          return f;

      return true;
  },

});
