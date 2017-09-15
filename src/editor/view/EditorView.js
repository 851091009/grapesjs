var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  // 初始化参数
  // 先看这个方法
  // 当创建model实例时，可以传入 属性 (attributes)初始值，这些值会被 set （设置）到 model。 如果定义了 initialize 函数，该函数会在model创建后执行。
  // 有两个参数
  // model: em
  // config: c
  // this 是全局的，不管在任何一个位置打印都有全部属性
  initialize() {
  
    this.model.view = this;
    this.pn         = this.model.get('Panels'); // 这里的model 是 editor model.js
    this.conf       = this.model.config;
    this.className  = this.conf.stylePrefix + 'editor';
    this.model.on('loaded', () => {
      this.pn.active();
      this.model.runDefault();
      setTimeout(() => this.model.trigger('load'), 0);
    });
  },
  // 渲染
  render() {
   
    var model  = this.model;          // 这是model 是 editor 的模型
    var um     = model.get('UndoManager');   // 撤销 管理器
    var dComps = model.get('DomComponents'); // Dom组件
    var config = model.get('Config');        // 配置参数
    // loadCompsOnRender: 此选项还提供用于加载的自定义组件类型。元素内的帆布
    if(config.loadCompsOnRender) {
      if (config.clearOnRender) {
        dComps.clear();
      }
      dComps.getComponents().reset(config.components);
      model.loadOnStart();
      um.clear();
      // This will init loaded components
      // 这将初始化加载的组件。
      dComps.onLoad();
    }
    
    var conf   = this.conf;
    var contEl = $(conf.el || ('body ' + conf.container));
    this.$el.empty(); // jquery 函数    div.gjs-editor

    if(conf.width)
      contEl.css('width', conf.width);

    if(conf.height)
      contEl.css('height', conf.height);

    // Canvas 画板
    this.$el.append(model.get('Canvas').render());

    // Panels
    // 面板
    this.$el.append(this.pn.render());// 控制所有的按钮显示
    this.$el.attr('class', this.className);
    contEl.addClass(conf.stylePrefix + 'editor-cont');
    contEl.empty().append(this.$el);

    return this;
  }
});
