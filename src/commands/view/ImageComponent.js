var Backbone = require('backbone');
var InsertCustom = require('./InsertCustom');

module.exports = _.extend({}, InsertCustom, {

  /**
   * Trigger before insert
   * 触发前插入
   * @param   {Object}  object
   * @private
   *
   * */
  beforeInsert(object) {
    object.type = 'image';
    object.style = {};
    object.attributes = {};
    object.attributes.onmousedown = 'return false';
    if (this.config.firstCentered &&
       this.getCanvasWrapper() == this.sorter.target ) {
      object.style.margin = '0 auto';
    }
  },

  /**
   * Trigger after insert
   * 触发后插入
   * @param  {Object}  model  Model created after insert
   * @private
   * */
  afterInsert(model) {
    model.trigger('dblclick');
    if(this.sender)
      this.sender.set('active', false);
  },


});
