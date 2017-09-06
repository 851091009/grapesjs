var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events: {
    'change': 'handleChange',
  },

  template: _.template(`<span class='<%= holderClass %>'></span>`),

  initialize(opts) {
    var opt = opts || {};
    var ppfx = opt.ppfx || '';
    this.target = opt.target || {};
    this.inputClass = ppfx + 'field';
    this.inputHolderClass = ppfx + 'input-holder';
    this.ppfx = ppfx;
    this.listenTo(this.model, 'change:value', this.handleModelChange);
  },

  /**
   * Handled when the view is changed
   * 视图更改时处理
   */
  handleChange(e) {
    e.stopPropagation();
    this.setValue(this.getInputEl().value);
  },

  /**
   * Set value to the model
   * 将值设置为模型
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value, opts) {
    var opt = opts || {};
    var model = this.model;
    model.set({
      value: value || model.get('defaults')
    }, opt);

    // Generally I get silent when I need to reflect data to view without
    // reupdating the target
    //一般来说，当我需要反映数据来查看时，我不会更新目标
    if(opt.silent) {
      this.handleModelChange();
    }
  },

  /**
   * Updates the view when the model is changed
   * 更改模型时更新视图
   * */
  handleModelChange() {
    this.getInputEl().value = this.model.get('value');
  },

  /**
   * Get the input element
   * 获取输入元素
   * @return {HTMLElement}
   */
  getInputEl() {
    if(!this.inputEl) {
      this.inputEl = $('<input>', {
        type: 'text',
        class: this.inputCls,
        placeholder: this.model.get('defaults')
      });
    }
    return this.inputEl.get(0);
  },

  render() {
    var el = this.$el;
    el.addClass(this.inputClass);
    el.html(this.template({
      holderClass: this.inputHolderClass,
      ppfx: this.ppfx
    }));
    el.find('.'+ this.inputHolderClass).html(this.getInputEl());
    return this;
  }

});
