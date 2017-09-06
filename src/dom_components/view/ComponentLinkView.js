var Backbone = require('backbone');
var ComponentView = require('./ComponentTextView');

module.exports = ComponentView.extend({

  events: {
    'dblclick': 'enableEditing',
  },

  render(...args) {
    ComponentView.prototype.render.apply(this, args);

    // I need capturing instead of bubbling as bubbled clicks from other
    // children will execute the link event
    // 我需要而鼓泡冒点击其他捕获
    // 儿童将执行链接事件
    this.el.addEventListener('click', this.prevDef, true);

    return this;
  },

});
