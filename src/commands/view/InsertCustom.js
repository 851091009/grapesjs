var Backbone = require('backbone');
var CreateComponent = require('./CreateComponent');

module.exports = _.extend({}, CreateComponent, {

  init(...args) {
    CreateComponent.init.apply(this, args);
    _.bindAll(this, 'insertComponent');
    this.allowDraw = 0;
  },

  /**
   * Run method
   * 运行方法
   * @private
   * */
  run(em, sender, options) {
    this.em = em;
    this.sender = sender;
    this.opt = options || {};
    this.$wr = this.$wrapper;
    this.enable();
  },

  enable(...args) {
    CreateComponent.enable.apply(this, args);
    this.$wr.on('click', this.insertComponent);
  },

  /**
   * Start insert event
   * 开始插入事件
   * @private
   * */
  insertComponent() {
    this.$wr.off('click', this.insertComponent);
    this.stopSelectPosition();
    var object = this.buildContent();
    this.beforeInsert(object);
    var index = this.sorter.lastPos.index;
    // By default, collections do not trigger add event, so silent is used
    var model = this.create(this.sorter.target, object, index, null, {silent: false});

    if(this.opt.terminateAfterInsert && this.sender)
      this.sender.set('active', false);
    else
      this.enable();

    if(!model)
      return;

    if(this.em)
        this.em.editor.initChildrenComp(model);

    this.afterInsert(model, this);
  },

  /**
   * Trigger before insert
   * 触发前插入
   * @param   {Object}  obj
   * @private
   * */
  beforeInsert(obj) {},

  /**
   * Trigger after insert
   * 触发后插入
   * @param  {Object}  model  Model created after insert
   * @private
   * */
  afterInsert(model) {},

  /**
   * Create different object, based on content, to insert inside canvas
   * 根据内容创建不同的对象，将其插入画布中
   *
   * @return   {Object}
   * @private
   * */
  buildContent() {
    return this.opt.content || {};
  },
});
