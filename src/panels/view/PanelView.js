var Backbone = require('backbone');
var ButtonsView = require('./ButtonsView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config    = o.config || {};
    this.pfx       = this.config.stylePrefix || '';
    this.buttons   = this.model.get('buttons');
    this.className = this.pfx + 'panel';
    this.id = this.pfx + this.model.get('id');
    // change：当有输入的变化的时候触发此时间
    this.listenTo(this.model, 'change:appendContent', this.appendContent);
    this.listenTo(this.model, 'change:content', this.updateContent);
  },

  /**
   * Append content of the panel
   * 附加面板的内容
   * */
  appendContent() {
    this.$el.append(this.model.get('appendContent'));
  },

  /**
   * Update content
   * 更新内容
   * */
  updateContent() {
    this.$el.html(this.model.get('content'));
  },
  // resize: 翻译 调整大小
  initResize() {
    const em = this.config.em;
    const editor = em ? em.get('Editor') : '';
    const resizable = this.model.get('resizable');

    if (editor && resizable) {
      var resz = resizable === true ? [1, 1, 1, 1] : resizable;
      var resLen = resz.length;
      var tc, cr, bc, cl = 0;

      // Choose which sides of the panel are resizable
      // 选择面板的哪些面可调整大小
      if (resLen == 2) {
        tc = resz[0];
        bc = resz[0];
        cr = resz[1];
        cl = resz[1];
      } else if (resLen == 4) {
        tc = resz[0];
        cr = resz[1];
        bc = resz[2];
        cl = resz[3];
      }

      var resizer = editor.Utils.Resizer.init({
        tc,
        cr,
        bc,
        cl,
        tl: 0,
        tr: 0,
        bl: 0,
        br: 0,
        appendTo: this.el,
        prefix: editor.getConfig().stylePrefix,
        posFetcher: (el) => {
          var rect = el.getBoundingClientRect();
          return {
            left: 0, top: 0,
            width: rect.width,
            height: rect.height
          };
        }
      });
      resizer.blur = () => {};
      resizer.focus(this.el);
    }
  },
  // 这里是重点
  render() {
    this.$el.attr('class', this.className);
    // console.log(this.$el);
    if(this.id)
      this.$el.attr('id', this.id);

    if (this.buttons.length) {
      // ButtonsView: 这里显示的是 中间右侧的按钮
      var buttons  = new ButtonsView({
        collection: this.buttons,
        config: this.config,
      });
      this.$el.append(buttons.render().el);
    }

    this.$el.append(this.model.get('content'));
    return this;
  },

});
