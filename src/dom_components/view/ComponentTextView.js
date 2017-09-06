var Backbone = require('backbone');
var ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({

  events: {
    'dblclick': 'enableEditing',
    'change': 'parseRender',
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    _.bindAll(this,'disableEditing');
    const model = this.model;
    this.listenTo(model, 'focus active', this.enableEditing);
    this.listenTo(model, 'change:content', this.updateContent);
    this.rte = this.config.rte || '';
    this.activeRte = null;
    this.em = this.config.em;
  },

  /**
   * Enable the component to be editable
   * 使组件可编辑
   * @param {Event} e
   * @private
   * */
  enableEditing(e) {
    var editable = this.model.get('editable');
    if(this.rte && editable) {
      try {
        this.activeRte = this.rte.attach(this, this.activeRte);
        this.rte.focus(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }
    }
    this.toggleEvents(1);
  },

  /**
   * Disable this component to be editable
   * 禁用此组件为可编辑
   * @param {Event}
   * @private
   * */
  disableEditing(e) {
    var model = this.model;
    var editable = model.get('editable');

    if(this.rte && editable) {
      try {
        this.rte.detach(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }
      var el = this.getChildrenContainer();
      // Avoid double content by removing its children components
      // 通过删除其子组件避免双内容
      model.get('components').reset();
      model.set('content', el.innerHTML);
    }

    if(!this.rte.customRte && editable) {
      this.parseRender();
    }

    this.toggleEvents();
  },

  /**
   * Isolate disable propagation method
   * 隔离禁用传播方法
   * @param {Event}
   * @private
   * */
  disablePropagation(e) {
    e.stopPropagation();
  },

  /**
   * Parse content and re-render it
   * 解析内容并重新呈现
   * @private
   */
  parseRender() {
    var el = this.getChildrenContainer();
    var comps = this.model.get('components');
    var opts = {silent: true};

    // Avoid re-render on reset with silent option
    // 避免重新渲染重置与沉默的选择
    comps.reset(null, opts);
    comps.add(el.innerHTML, opts);
    this.model.set('content', '');
    this.render();

    // As the reset was in silent mode I need to notify
    // the navigator about the change

    // 由于重置处于静默模式，我需要通知
    // 关于变化的导航器
    comps.trigger('resetNavigator');
  },

  /**
   * Enable/Disable events
   * @param {Boolean} enable
   */
  toggleEvents(enable) {
    var method = enable ? 'on' : 'off';

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document, this.rte];
    $(elDocs).off('mousedown', this.disableEditing);
    $(elDocs)[method]('mousedown', this.disableEditing);

    // Avoid closing edit mode on component click
    this.$el.off('mousedown', this.disablePropagation);
    this.$el[method]('mousedown', this.disablePropagation);
  },

});
