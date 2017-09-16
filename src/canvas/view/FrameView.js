var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  tagName: 'iframe',

  attributes: {
    src: 'about:blank',
    allowfullscreen: 'allowfullscreen' // 允许全屏=true。也就是允许全屏，=false时表示不允许全屏。
  },

  initialize(o) {
    _.bindAll(this, 'udpateOffset');// 绑定函数
    this.config = o.config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.em = this.config.em;
    this.motionsEv = 'transitionend oTransitionEnd transitionend webkitTransitionEnd';
    this.listenTo(this.em, 'change:device', this.updateWidth);// 监听设备的变化
  },

  /**
   * Update width of the frame
   * 更新框架的宽度
   * @private
   */
  updateWidth(model) {  
    var device = this.em.getDeviceModel();
    this.el.style.width = device ? device.get('width') : '';
    this.udpateOffset();
    this.$el.on(this.motionsEv, this.udpateOffset);
  },
  /**
   * 更新偏移
   */  
  udpateOffset() {
    var offset = this.em.get('Canvas').getOffset();
    this.em.set('canvasOffset', offset);
    this.$el.off(this.motionsEv, this.udpateOffset);
  },
  /**
   * 获取 body 内容
   */
  getBody() {
    // jquery: contents() 方法获得匹配元素集合中每个元素的子节点，包括文本和注释节点。
    this.$el.contents().find('body');
  },

  getWrapper() {
    return this.$el.contents().find('body > div');
  },

  render() {
    this.$el.attr({class: this.ppfx + 'frame'});
    return this;
  },

});
