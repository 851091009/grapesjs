var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.opts = o || {};
    this.config = o.config || {};
    this.listenTo( this.collection, 'add', this.addTo );
    this.listenTo( this.collection, 'reset', this.render );
  },

  /**
   * Add to collection
   * 加入收藏
   * @param  {Object} Model
   *
   * @return  void
   * @private
   * */
  addTo(model) {
    var i  = this.collection.indexOf(model);
    this.addToCollection(model, null, i);

    var em = this.config.em;
    if(em) {
      // OLD
      em.trigger('add:component', model);
      em.trigger('component:add', model);
    }
  },

  /**
   * Add new object to collection
   * 向集合中添加新对象
   * @param  {Object}  Model
   * @param  {Object}   Fragment collection
   * @param  {Integer}  Index of append
   *
   * @return   {Object}   Object rendered
   * @private
   * */
  addToCollection(model, fragmentEl, index) {
    if(!this.compView)
      this.compView  =  require('./ComponentView');
    var fragment  = fragmentEl || null,
    viewObject  = this.compView;
    //console.log('Add to collection', model, 'Index',i);

    var dt = this.opts.componentTypes;

    var type = model.get('type');

    for (var it = 0; it < dt.length; it++) {
      var dtId = dt[it].id;
      if(dtId == type) {
        viewObject = dt[it].view;
        break;
      }
    }
    //viewObject = dt[type] ? dt[type].view : dt.default.view;

    var view = new viewObject({
      model,
      config: this.config,
      componentTypes: dt,
    });
    var rendered  = view.render().el;
    if(view.model.get('type') == 'textnode')
      rendered =  document.createTextNode(view.model.get('content'));

    if(fragment){
      fragment.appendChild(rendered);
    }else{
      var p  = this.$parent;
      var pc = p.children;
      if(typeof index != 'undefined'){
        var method  = 'before';
        // If the added model is the last of collection
        // need to change the logic of append
        // 如果添加模型也是最后的收集
        // 需要改变的“逻辑”的append
        if(pc && p.children().length == index){
          index--;
          method  = 'after';
        }
        // In case the added is new in the collection index will be -1
        // 在案例/加冰的新指标的收集，将1
        if(index < 0) {
          p.append(rendered);
        }else {
          if(pc) {
            p.children().eq(index)[method](rendered);
          }
        }
      }else{
        p.append(rendered);
      }
    }

    return rendered;
  },

  render($p) {
    var fragment   = document.createDocumentFragment();
    this.$parent  = $p || this.$el;
    this.$el.empty();
    this.collection.each(function(model){
      this.addToCollection(model, fragment);
    },this);
    this.$el.append(fragment);

    return this;
  }

});
