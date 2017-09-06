var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  // Default view
  // 默认视图
  itemView: '',

  // Defines the View per type
  // 定义每个类型的视图
  itemsView: '',

  itemType: 'type',

  initialize(opts, config) {
    this.config = config || {};
  },


  /**
   * Add new model to the collection
   * 向集合添加新模型
   * @param {Model} model
   * @private
   * */
  addTo(model) {
    this.add(model);
  },

  /**
   * Render new model inside the view
   * 在视图中渲染新模型
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    var frag = fragment || null;
    var itemView = this.itemView;
    var typeField = model.get(this.itemType);
    if(this.itemsView && this.itemsView[typeField]){
      itemView = this.itemsView[typeField];
    }
    var view = new itemView({
      model,
      config: this.config
    }, this.config);
    var rendered = view.render().el;

    if(frag)
      frag.appendChild(rendered);
    else
      this.$el.append(rendered);
  },



  render() {
    var frag = document.createDocumentFragment();
    this.$el.empty();

    if(this.collection.length)
      this.collection.each(function(model){
        this.add(model, frag);
      }, this);

    this.$el.append(frag);
    return this;
  },

});
