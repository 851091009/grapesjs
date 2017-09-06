var Component = require('./ComponentText');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'link',
      tagName: 'a',
      traits: ['title', 'href', 'target'],
  }),

  /**
   * Returns object of attributes for HTML
   * 返回HTML属性的对象
   * @return {Object}
   * @private
   */
  getAttrToHTML(...args) {
    var attr = Component.prototype.getAttrToHTML.apply(this, args);
    delete attr.onmousedown;
    return attr;
  },

},{

  /**
   * Detect if the passed element is a valid component.
   * In case the element is valid an object abstracted
   * from the element will be returned
   * 
   * 检测传入的元素是否是有效的组件。
   * 如果元素是有效的，对象将被抽象。
   * 将从元素返回
   * @param {HTMLElement}
   * @return {Object}
   * @private
   */
  isComponent(el) {
    var result = '';
    if(el.tagName == 'A'){
      result = {type: 'link'};
    }
    return result;
  },

});
