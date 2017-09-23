var Backbone  = require('backbone');
var PanelView = require('./PanelView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.opt = o || {};
    this.config = this.opt.config || {};
    this.pfx    = this.config.stylePrefix || '';
    // 让 object 监听 另一个（other）对象上的一个特定事件。不使用other.on(event, callback, object)，而使用这种形式的优点是：listenTo允许 object来跟踪这个特定事件，并且以后可以一次性全部移除它们。callback总是在object上下文环境中被调用。
    this.listenTo(this.collection, 'add', this.addTo ); // collection 是 panels 集合
    this.listenTo(this.collection, 'reset', this.render );
    this.className = this.pfx + 'panels';
  },

  /**
   * Add to collection
   * 加入收藏
   * @param Object Model
   *
   * @return Object
   * @private
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Add new object to collection
   * 将新对象添加到集合
   * @param  Object  Model
   * @param  Object   Fragment collection 片段收集
   * @param  integer  Index of append
   *
   * @return Object Object created
   * @private
   * */
  addToCollection(model, fragmentEl) {
    var fragment = fragmentEl || null;
    var view = new PanelView({
      model,
      config: this.config,
    });
    var rendered = view.render().el;
    var appendTo = model.get('appendTo');// 注意：默认都是没有 appendTo
    
    if (appendTo) {
      var appendEl = document.querySelector(appendTo);
      appendEl.appendChild(rendered);
    } else {
      if (fragment) {
        fragment.appendChild(rendered);
      } else {
        this.$el.append(rendered);
      }
    }

    view.initResize();
    return rendered;
  },

  render() {
    //https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment
    var fragment = document.createDocumentFragment(); // 创建一个新的空白的文档片段
    this.$el.empty();
    
    this.collection.each(function(model){
      this.addToCollection(model, fragment);
    }, this);

    this.$el.append(fragment);
    this.$el.attr('class', this.className);
    return this;
  }
});
