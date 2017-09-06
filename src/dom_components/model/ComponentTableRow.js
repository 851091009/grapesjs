var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
      type: 'row',
      tagName: 'tr',
      draggable: ['table', 'tbody', 'thead'],
      droppable: ['th', 'td']
  }),

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);

    // Clean the row from non cell components
    // 从非单元格组件中清除行
    var cells = [];
    var components = this.get('components');
    components.each(model => {
      if(model.get('type') == 'cell'){
        cells.push(model);
      }
    });
    components.reset(cells);
  }

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
    if(el.tagName == 'TR'){
      result = {type: 'row'};
    }
    return result;
  },

});
