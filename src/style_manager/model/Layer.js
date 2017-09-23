var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  // 默认值
  defaults: {
    index: '',
    value: '',
    values: {},
    active: true,
    preview: false,
  },
  // 构造函数
  initialize() {
    var value = this.get('value');

    // If there is no value I'll try to get it from values 如果没有价值，我会尝试从值中获取它
    // I need value setted to make preview working         我需要设置预设值的值
    if(!value){
      var val = '';
      var values = this.get('values');

      for (var prop in values) {
        val += ' ' + values[prop];
      }

      this.set('value', val.trim());
    }
  },

});
