var Backbone = require('backbone');
var ComponentsView = require('./ComponentsView');

module.exports = Backbone.View.extend({

  className() {
    return this.getClasses();
  },

  tagName() {
    return this.model.get('tagName');
  },

  initialize(opt) {
    var model = this.model;
    this.opts = opt || {};
    this.config = this.opts.config || {};
    this.em = this.config.em || '';
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.components = model.get('components');
    this.attr = model.get("attributes");
    this.classe = this.attr.class || [];
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:style', this.updateStyle);
    this.listenTo(model, 'change:attributes', this.updateAttributes);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.listenTo(model, 'change:state', this.updateState);
    this.listenTo(model, 'change:script', this.render);
    this.listenTo(model, 'change', this.handleChange);
    this.listenTo(model.get('classes'), 'add remove change', this.updateClasses);
    this.$el.data('model', model);
    model.view = this;
    this.$el.data("collection", this.components);

    if(model.get('classes').length)
      this.importClasses();

    this.init();
  },

  /**
   * Initialize callback
   * 初始化回调
   */
  init() {},

  /**
   * Handle any property change
   * 改变任何财产的处理
   * @private
   */
  handleChange() {
    var em = this.em;
    if(em) {
      var model = this.model;
      em.trigger('component:update', model);

      for(var prop in model.changed) {
        em.trigger('component:update:' + prop, model);
      }
    }
  },

  /**
   * Import, if possible, classes inside main container
   * 如果可能的话，在进出，容器类的手
   * @private
   * */
  importClasses() {
    var clm = this.config.em.get('SelectorManager');

    if(clm){
      this.model.get('classes').each(m => {
          clm.add(m.get('name'));
      });
    }
  },

  /**
   * Fires on state update. If the state is not empty will add a helper class
   * 国家火灾的更新。if the state is not empty class will add helper在
   * @param  {Event} e
   * @private
   * */
  updateState(e) {
    var cl = 'hc-state';
    var state = this.model.get('state');

    if(state){
      this.$el.addClass(cl);
    }else{
      this.$el.removeClass(cl);
    }
  },

  /**
   * Update item on status change
   * 我们更新项目状态的变化
   * @param  {Event} e
   * @private
   * */
  updateStatus(e) {
    var el = this.el;
    var status = this.model.get('status');
    var pfx = this.pfx;
    var ppfx = this.ppfx;
    var selectedCls = pfx + 'selected';
    var selectedParentCls = selectedCls + '-parent';
    var freezedCls = `${ppfx}freezed`;
    var actualCls = el.getAttribute('class') || '';
    var cls = '';

    switch (status) {
        case 'selected':
          cls = `${actualCls} ${selectedCls}`;
          break;
        case 'selected-parent':
          cls = `${actualCls} ${selectedParentCls}`;
          break;
        case 'freezed':
          cls = `${actualCls} ${freezedCls}`;
          break;
        default:
          this.$el.removeClass(`${selectedCls} ${selectedParentCls} ${freezedCls}`);
    }

    cls = cls.trim();

    if (cls) {
      el.setAttribute('class', cls);
    }
  },

  /**
   * Get classes from attributes.
   * This method is called before initialize
   *
   * get from属性类。
   * 这种方法被称为初始化之前。
   * @return  {Array}|null
   * @private
   * */
  getClasses() {
    var attr = this.model.get("attributes"),
      classes  = attr['class'] || [];
    if(classes.length){
      return classes.join(" ");
    }else
      return null;
  },

  /**
   * Update attributes
   * 更新属性
   * @private
   * */
  updateAttributes() {
    var model = this.model;
    var attributes = {},
      attr = model.get("attributes");
    for(var key in attr) {
        if(attr.hasOwnProperty(key))
          attributes[key] = attr[key];
    }

    // Update src
    if(model.get('src'))
      attributes.src = model.get('src');

    if(model.get('highlightable'))
      attributes['data-highlightable'] = 1;

    var styleStr = this.getStyleString();

    if(styleStr)
      attributes.style = styleStr;

    this.$el.attr(attributes);
  },

  /**
   * Update style attribute
   * 更新样式属性
   * @private
   * */
  updateStyle() {
    this.$el.attr('style', this.getStyleString());
  },

  /**
   * Update component content
   * 组件的更新内容
   * @private
   * */
  updateContent() {
    this.getChildrenContainer().innerHTML = this.model.get('content');
  },

  /**
   * Return style string
   * 返回字符串的风格
   * @return  {string}
   * @private
   * */
  getStyleString() {
    var style  = '';
    this.style = this.model.get('style');
    for(var key in this.style) {
        if(this.style.hasOwnProperty(key))
          style += key + ':' + this.style[key] + ';';
    }

    return style;
  },

  /**
   * Update classe attribute
   * 类属性更新
   * @private
   * */
  updateClasses() {
    var str = '';

    this.model.get('classes').each(model => {
      str += model.get('name') + ' ';
    });
    str = str.trim();

    if(str)
      this.$el.attr('class', str);
    else
      this.$el.removeAttr('class');

    // Regenerate status class
    // 重生的状态类
    this.updateStatus();
  },

  /**
   * Reply to event call
   * Reply to call事件
   * @param object Event that generated the request
   * @private
   * */
  eventCall(event) {
    event.viewResponse = this;
  },

  /**
   * Prevent default helper
   * 防止违约的帮手
   * @param  {Event} e
   * @private
   */
  prevDef(e) {
    e.preventDefault();
  },

  /**
   * Render component's script
   * 渲染组件的脚本
   * @private
   */
  updateScript() {
    if (!this.model.get('script')) {
      return;
    }

    var em = this.em;
    if(em) {
      var canvas = em.get('Canvas');
      canvas.getCanvasView().updateScript(this);
    }
  },

  /**
   * Return children container
   * 集装箱；儿童
   * Differently from a simple component where children container is the
   * component itself
   * <my-comp>
   *  <!--
   *    <child></child> ...
   *   -->
   * </my-comp>
   * You could have the children container more deeper
   * <my-comp>
   *  <div></div>
   *  <div></div>
   *  <div>
   *    <div>
   *      <!--
   *        <child></child> ...
   *      -->
   *    </div>
   *  </div>
   * </my-comp>
   * @return HTMLElement
   * @private
   */
  getChildrenContainer() {
    var container = this.el;

    if (typeof this.getChildrenSelector == 'function') {
      container = this.el.querySelector(this.getChildrenSelector());
    } else if (typeof this.getTemplate == 'function') {
      // Need to find deepest first child
    }

    return container;
  },

  /**
   * Render children components
   * 儿童的渲染组件
   * @private
   */
  renderChildren() {
    var view = new ComponentsView({
      collection: this.model.get('components'),
      config: this.config,
      componentTypes: this.opts.componentTypes,
    });

    var container = this.getChildrenContainer();
    var childNodes = view.render($(container)).el.childNodes;
    childNodes = Array.prototype.slice.call(childNodes);

    for (var i = 0, len = childNodes.length ; i < len; i++) {
      container.appendChild(childNodes.shift());
    }

    // If the children container is not the same as the component
    // (so likely fetched with getChildrenSelector()) is necessary
    // to disable pointer-events for all nested components as they
    // might prevent the component to be selected

    // 如果子容器与组件不同
    //（很可能用getChildrenSelector（）获取）是必要的
    // 禁用所有嵌套组件的指针事件
    // 可能会阻止选择该组件
    if (container !== this.el) {
      var disableNode = el => {
        var children = Array.prototype.slice.call(el.children);
        children.forEach(el => {
          el.style['pointer-events'] = 'none';
          if (container !== el) {
            disableNode(el);
          }
        });
      };
      disableNode(this.el);
    }
  },

  renderAttributes() {
    this.updateAttributes();
    this.updateClasses();
  },

  render() {
    this.renderAttributes();
    var model = this.model;
    this.updateContent();
    this.renderChildren();
    this.updateScript();
    return this;
  },

});
