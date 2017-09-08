var Backbone = require('backbone');
var Button = require('./Button');

module.exports = Backbone.Collection.extend({

  model: Button,

  /**
   * Deactivate all buttons, except one passed
   * 取消所有按钮，除了一个通过
   * @param  {Object}  except  Model to ignore 模型忽略
   * @param  {Boolean}  r     Recursive flag   递归标志
   *
   * @return  void
   * */
  deactivateAllExceptOne(except, r) {
    this.forEach((model, index) => {
      if(model !== except){
        model.set('active', false);
        if(r && model.get('buttons').length)
          model.get('buttons').deactivateAllExceptOne(except,r);
      }
    });
  },

  /**
   * Deactivate all buttons
   * 停用所有按钮
   * @param  {String}  ctx Context string 上下文字符串
   *
   * @return  void
   * */
  deactivateAll(ctx) {
    var context = ctx || '';
    this.forEach((model, index) => {
      if( model.get('context') == context ){
        model.set('active', false);
        if(model.get('buttons').length)
          model.get('buttons').deactivateAll(context);
      }
    });
  },

});
