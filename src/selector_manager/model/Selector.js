var Backbone = require('backbone');

const Selector = Backbone.Model.extend({

  idAttribute: 'name',

  defaults: {
    name: '',
    label: '',

    // Type of the selector
    // 选择器的类型
    type: 'class',

    // If not active it's not selectable by the style manager (uncheckboxed)
    // 如果不活动，则不能由样式管理器选择（取消选中）
    active: true,

    // Can't be seen by the style manager, therefore even by the user
    // Will be rendered only in export code
    // 风格管理器无法看到，因此即使是由用户看到
    // 将仅在导出代码中呈现
    private: false,

    // If true, can't be removed by the user, from the attacched element
    // 如果为true，则不能由用户从附件中删除
    protected: false,
  },

  initialize() {
    const name = this.get('name');
    const label = this.get('label');

    if (!name) {
      this.set('name', label);
    } else if (!label) {
      this.set('label', name);
    }

    this.set('name', Selector.escapeName(this.get('name')));
  },

  /**
   * Get full selector name
   * 获取完整的选择器名称
   * @return {string}
   */
  getFullName() {
    let init = '';

    switch (this.get('type')) {
      case 'class':
        init = '.';
        break;
      case 'id':
        init = '#';
        break;
    }

    return init + this.get('name');
  }

}, {
  /**
   * Escape string
   * 逃脱字符串
   * @param {string} name
   * @return {string}
   * @private
   */
  escapeName(name) {
    return `${name}`.trim().replace(/([^a-z0-9\w]+)/gi, '-');
  },
});

module.exports = Selector;
