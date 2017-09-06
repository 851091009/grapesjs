var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  idAttribute: 'name',

  defaults :{
    name: '',

    // Width to set for the editor iframe
    // 宽度设置为编辑iframe
    width: '',

    // The width which will be used in media queries,
    // 将用于媒体查询的宽度，
    // If empty the width will be used
    // 如果空，宽度将被使用。
    widthMedia: null,
  },

  initialize() {
    if (this.get('widthMedia') == null) {
      this.set('widthMedia', this.get('width'));
    }
  }

});
