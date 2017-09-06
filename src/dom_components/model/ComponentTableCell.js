var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'cell',
      tagName: 'td',
      draggable: ['tr'],
  }),

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
    var tag = el.tagName;
    if(tag == 'TD' || tag == 'TH'){
      result = {
        type: 'cell',
        tagName: tag.toLowerCase()
      };
    }
    return result;
  },

});
