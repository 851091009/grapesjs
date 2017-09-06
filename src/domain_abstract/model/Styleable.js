export default {

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * 
   * 要触发模型上的风格变更事件
   * 传递一个新的对象实例
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop) {
    return Object.assign({}, this.getStyle(), prop);
  },

  /**
   * Get style object
   * 获取样式对象
   * @return {Object}
   */
  getStyle() {
    return Object.assign({}, this.get('style'));
  },

  /**
   * Set new style object
   * 设置新的样式对象
   * @param {Object} prop
   * @param {Object} opts
   */
  setStyle(prop = {}, opts = {}) {
    this.set('style', Object.assign({}, prop), opts);
  },

  /**
   * Add style property
   * 添加样式属性
   * @param {Object|string} prop
   * @param {string} value
   * @example
   * this.addStyle({color: 'red'});
   * this.addStyle('color', 'blue');
   */
  addStyle(prop, value = '', opts = {}) {
    if (typeof prop == 'string') {
      prop = {
        prop: value
      };
    } else {
      opts = value || {};
    }

    prop = this.extendStyle(prop);
    this.setStyle(prop, opts);
  },

  /**
   * Remove style property
   * 删除样式属性
   * @param {string} prop
   */
  removeStyle(prop) {
    let style = this.getStyle();
    delete style[prop];
    this.setStyle(style);
  }
}
