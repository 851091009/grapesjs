module.exports = require('backbone').Model.extend({

  idAttribute: 'src',

  defaults: {
    type:  '',
    src:  '',
  },

  /**
   * Get filename of the asset
   * 获取资产的文件名
   * @return  {string}
   * @private
   * */
  getFilename() {
    return  this.get('src').split('/').pop();
  },

  /**
   * Get extension of the asset
   * 获取资产的扩展
   * @return  {string}
   * @private
   * */
  getExtension() {
    return  this.getFilename().split('.').pop();
  },

});
