var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events: {
    mousedown: 'startDrag'
  },

  initialize(o, config) {
    _.bindAll(this, 'endDrag');
    this.config = config || {};
    this.ppfx = this.config.pStylePrefix || '';
    this.listenTo(this.model, 'destroy remove', this.remove);
    this.doc = $(document);
  },

  /**
   * Start block dragging
   * 启动块拖动
   * @private
   */
  startDrag(e) {
    //Right or middel click
    if (e.button !== 0) {
      return;
    }

    if(!this.config.getSorter) {
      return;
    }

    this.config.em.refreshCanvas();
    var sorter = this.config.getSorter();
    sorter.setDragHelper(this.el, e);
    sorter.startSort(this.el);
    sorter.setDropContent(this.model.get('content'));
    this.doc.on('mouseup', this.endDrag);
  },

  /**
   * Drop block
   * @private
   */
  endDrag(e) {
    this.doc.off('mouseup', this.endDrag);
    const sorter = this.config.getSorter();

    // After dropping the block in the canvas the mouseup event is not yet
    // triggerd on 'this.doc' and so clicking outside, the sorter, tries to move
    // things (throws false positives). As this method just need to drop away
    // the block helper I use the trick of 'moved = 0' to void those errors.
    // 在画布中放置块后，mouseup事件还没有
    // triggerd on'this.doc'，所以点击外面，分拣机，试图移动
    // 事情（抛出假阳性）。 因为这种方法只需要掉下来
    // 块助手我使用'moved = 0'的技巧来消除这些错误。
    sorter.moved = 0;
    sorter.endMove();
  },

  render() {
    var className = this.ppfx + 'block';
    this.$el.addClass(className);
    this.el.innerHTML = '<div class="' + className + '-label">' + this.model.get('label') + '</div>';
    return this;
  },

});
