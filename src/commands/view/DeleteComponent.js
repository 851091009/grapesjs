var Backbone        = require('backbone');
var SelectComponent = require('./SelectComponent');

module.exports = _.extend({},SelectComponent,{

  init(o) {
    _.bindAll(this, 'startDelete', 'stopDelete', 'onDelete');
    this.hoverClass  = this.pfx + 'hover-delete';
    this.badgeClass  = this.pfx + 'badge-red';
  },

  enable() {
    var that = this;
    this.$el.find('*')
      .mouseover(this.startDelete)
      .mouseout(this.stopDelete)
      .click(this.onDelete);
  },

  /**
   * Start command
   * 启动命令
   * @param {Object}  e
   * @private
   */
  startDelete(e) {
      e.stopPropagation();
      var $this   =  $(e.target);

      // Show badge if possible
      // 如果可能的话，显示徽章
      if($this.data('model').get('removable')){
        $this.addClass(this.hoverClass);
        this.attachBadge($this.get(0));
      }

  },

  /**
   * Stop command
   * 停止命令
   * @param {Object}  e
   * @private
   */
  stopDelete(e) {
      e.stopPropagation();
      var $this   =  $(e.target);
      $this.removeClass(this.hoverClass);

      // Hide badge if possible
      // 如果可能的话，隐藏徽章
      if(this.badge)
        this.badge.css({ left: -1000, top:-1000 });
  },

  /**
   * Delete command
   * 删除命令
   * @param {Object}  e
   * @private
   */
  onDelete(e) {
    e.stopPropagation();
    var $this = $(e.target);

    // Do nothing in case can't remove
    // 什么事都不能去掉
    if(!$this.data('model').get('removable'))
      return;

    $this.data('model').destroy();
    this.removeBadge();
    this.clean();
  },

  /**
   * Updates badge label
   * 更新的徽章标签
   * @param   {Object}  model
   * @private
   * */
  updateBadgeLabel(model) {
    this.badge.html( 'Remove ' + model.getName() );
  },

});
