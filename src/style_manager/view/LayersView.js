var Backbone = require('backbone');
var LayerView = require('./LayerView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config = o.config || {};
    this.stackModel  = o.stackModel;
    this.preview = o.preview;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    let pfx = this.pfx;
    let ppfx = this.ppfx;
    let collection = this.collection;
    this.className = `${pfx}layers ${ppfx}field`;
    this.listenTo(collection, 'add', this.addTo);
    this.listenTo(collection, 'deselectAll', this.deselectAll );
    this.listenTo(collection, 'reset', this.render);

    var em = this.config.em || '';
    var utils = em ? em.get('Utils') : '';

    this.sorter = utils ? new utils.Sorter({
      container: this.el,
      ignoreViewChildren: 1,
      containerSel: `.${pfx}layers`,
      itemSel: `.${pfx}layer`,
      pfx: this.config.pStylePrefix,
    }) : '';

    // For the Sorter
    // 对于分拣机
    collection.view = this;
    this.$el.data('model', collection);
    this.$el.data('collection', collection);
  },

  /**
   * Add to collection
   * 加入收藏
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model) {
    var i  = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  },

  /**
   * Add new object to collection
   * 将新对象添加到集合
   * @param Object Model
   * @param Object Fragment collection      片段收集
   * @param  {number} index Index of append 附加索引
   *
   * @return Object Object created 创建对象
   * */
  addToCollection(model, fragmentEl, index) {
    var fragment = fragmentEl || null;
    var viewObject = LayerView;

    if(typeof this.preview !== 'undefined'){
      model.set('preview', this.preview);
    }

    var view = new viewObject({
        model,
        stackModel: this.stackModel,
        config: this.config,
        sorter: this.sorter
    });
    var rendered  = view.render().el;

    if(fragment){
      fragment.appendChild( rendered );
    }else{
      if(typeof index != 'undefined'){
        var method  = 'before';
        // If the added model is the last of collection 如果添加的模型是最后的集合
        // need to change the logic of append           需要改变追加的逻辑
        if(this.$el.children().length == index){
          index--;
          method = 'after';
        }
        // In case the added is new in the collection index will be -1
        // 如果添加的是新的集合索引将为-1
        if(index < 0){
          this.$el.append(rendered);
        }else
          this.$el.children().eq(index)[method](rendered);
      }else
        this.$el.append(rendered);
    }

    return rendered;
  },

  /**
   * Deselect all
   * 全部取消选择
   * @return void
   * */
  deselectAll() {
    this.$el.find('.'+ this.pfx  +'layer').removeClass(this.pfx + 'active');
  },

  render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model){
      this.addToCollection(model, fragment);
    },this);

    this.$el.append(fragment);
    this.$el.attr('class', this.className);

    if(this.sorter)
      this.sorter.plh = null;

    return this;
  }
});
