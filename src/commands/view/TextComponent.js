var Backbone = require('backbone');
var CreateComponent = require('./CreateComponent');

module.exports = _.extend({}, CreateComponent, {

  /**
   * This event is triggered at the beginning of a draw operation
   * 此事件在绘图操作开始时触发。
   * @param   {Object}   component  Object component before creation
   * @private
   * */
  beforeDraw(component) {
    component.type = 'text';
    if(!component.style)
      component.style  = {};
    component.style.padding = '10px';
  },

  /**
   * This event is triggered at the end of a draw operation
   * 此事件在绘制操作结束时触发。
   * @param   {Object}  model  Component model created
   * @private
   * */
  afterDraw(model) {
    if(!model || !model.set)
      return;
    model.trigger('focus');
    if(this.sender)
      this.sender.set('active', false);
  },

});
