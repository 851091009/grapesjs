module.exports = () => {

  const Sorter  = require('./Sorter'); // 拖拽事件
  const Resizer = require('./Resizer');
  const Dragger = require('./Dragger');// 拖拽

  return {
    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'Utils',

    /**
     * Initialize module
     */
    init() {
      return this;
    },

    Sorter,
    Resizer,
    Dragger,
  };
};
