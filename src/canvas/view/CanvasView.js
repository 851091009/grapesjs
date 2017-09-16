var Backbone = require('backbone');
var FrameView = require('./FrameView');

module.exports = Backbone.View.extend({

  initialize(o) {
    _.bindAll(this, 'renderBody', 'onFrameScroll', 'clearOff');
    this.config = o.config || {};
    this.em = this.config.em || {};
    this.ppfx  = this.config.pStylePrefix || '';
    this.className  = this.config.stylePrefix + 'canvas';
    this.listenTo(this.em, 'change:canvasOffset', this.clearOff);
    this.frame = new FrameView({
      model: this.model.get('frame'),
      config: this.config
    });
  },

  /**
   * Update tools position
   * 更新工具位置
   * @private
   */
  onFrameScroll() {
    var u = 'px';
    var body = this.frame.el.contentDocument.body;
    this.toolsEl.style.top = '-' + body.scrollTop + u;
    this.toolsEl.style.left = '-' + body.scrollLeft + u;
    this.em.trigger('canvasScroll');
  },

  /**
   * Insert scripts into head, it will call renderBody after all scripts loaded or failed
   * 将脚本插入到头部，它会在所有脚本加载或失败后调用renderBody
   * @private
   */
  renderScripts() {
      var frame = this.frame;
      var that = this;

      frame.el.onload = () => {
        var scripts = that.config.scripts.slice(0),  // clone
            counter = 0;

        function appendScript(scripts) {
          if (scripts.length > 0) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scripts.shift();// shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
            script.onerror = script.onload = appendScript.bind(null, scripts);
            frame.el.contentDocument.head.appendChild(script);// 添加到 页面中去
          } else {
            that.renderBody();
          }
        }
        appendScript(scripts);
      };
  },

  /**
   * Render inside frame's body
   * 渲染帧内体
   * @private
   */
  renderBody() {
    var wrap = this.model.get('frame').get('wrapper');
    var em = this.config.em;
    if(wrap) {
      var ppfx = this.ppfx;
      //var body = this.frame.$el.contents().find('body');
      var body = $(this.frame.el.contentWindow.document.body);
      var cssc = em.get('CssComposer');
      var conf = em.get('Config');
      var confCanvas = this.config;
      var protCss = conf.protectedCss;
      var externalStyles = '';
      // 循环加在CSS
      confCanvas.styles.forEach((style) => {
        externalStyles += `<link rel="stylesheet" href="${style}"/>`;
      });

      const colorWarn = '#ffca6f';

      let baseCss = `
        * {
          box-sizing: border-box;
        }
        html, body, #wrapper {
          min-height: 100%;
        }
        body {
          margin: 0;
          height: 100%;
          background-color: #fff
        }
        #wrapper {
          overflow: auto
        }
      `;
      // Remove `html { height: 100%;}` from the baseCss as it gives jumpings
      // effects (on ENTER) with RTE like CKEditor (maybe some bug there?!?)
      // With `body {height: auto;}` jumps in CKEditor are removed but in
      // Firefox is impossible to drag stuff in empty canvas, so bring back
      // `body {height: 100%;}`.
      // For the moment I give the priority to Firefox as it might be
      // CKEditor's issue

      // 从baseCss中删除`html {height：100％;}`，因为它提供跳转
      // 效果（在ENTER）与RTE像CKEditor（可能有一些bug吗？
      // 使用`body {height：auto;}`CKEditor中的跳转被删除，但在
      // Firefox不可能将东西拖到空的画布中，所以带回来
      // `body {height：100％;}`。
      // 目前我把Firefox优先考虑在内
      // CKEditor的问题

      let layoutCss = `
        .${ppfx}comp-selected{
          outline: 3px solid #3b97e3 !important
        }
        .${ppfx}comp-selected-parent{
          outline: 2px solid ${colorWarn} !important
        }
      `;

      // I need all this styles to make the editor work properly
      // 我需要所有这些样式，使编辑器正常工作
      var frameCss = baseCss +
        '.' + ppfx + 'dashed :not([contenteditable]) > *[data-highlightable]{outline: 1px dashed rgba(170,170,170,0.7); outline-offset: -2px}' +
        layoutCss +
        '.' + ppfx + 'no-select{user-select: none; -webkit-user-select:none; -moz-user-select: none}'+
        '.' + ppfx + 'freezed{opacity: 0.5; pointer-events: none}' +
        '.' + ppfx + 'no-pointer{pointer-events: none}' +
        '.' + ppfx + 'plh-image{background:#f5f5f5; border:none; height:50px; width:50px; display:block; outline:3px solid #ffca6f; cursor:pointer}' +
        '.' + ppfx + 'grabbing{cursor: grabbing; cursor: -webkit-grabbing}' +
        '* ::-webkit-scrollbar-track {background: rgba(0, 0, 0, 0.1)}' +
        '* ::-webkit-scrollbar-thumb {background: rgba(255, 255, 255, 0.2)}' +
        '* ::-webkit-scrollbar {width: 10px}' +
        (conf.canvasCss || '');
      frameCss += protCss || '';

      if (externalStyles) {
        body.append(externalStyles);
      }

      body.append('<style>' + frameCss + '</style>');
      body.append(wrap.render()).append(cssc.render());
      body.append(this.getJsContainer());
      em.trigger('loaded');
      this.frame.el.contentWindow.onscroll = this.onFrameScroll;// 跟新位置
      this.frame.udpateOffset();

      // When the iframe is focused the event dispatcher is not the same so
      // I need to delegate all events to the parent document
      // 当iframe被聚焦时，事件调度器不一样
      // 我需要将所有事件委托给父文档
      var doc = document;
      var fdoc = this.frame.el.contentDocument;
      fdoc.addEventListener('keydown', e => {
        doc.dispatchEvent(new KeyboardEvent(e.type, e));
      });
      fdoc.addEventListener('keyup', e => {
        doc.dispatchEvent(new KeyboardEvent(e.type, e));
      });
    }
  },

  /**
   * Get the offset of the element
   * 获取元素的偏移量。
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el) {
    var rect = el.getBoundingClientRect();// getBoundingClientRect: 返回元素的大小及其相对于视口的位置。
    var docBody = el.ownerDocument.body;
    return {
      top: rect.top + docBody.scrollTop,
      left: rect.left + docBody.scrollLeft,
      width: rect.width,
      height: rect.height,
    };
  },

  /**
   * Cleare cached offsets
   * 清除缓存的偏移
   * @private
   */
  clearOff() {
    this.frmOff = null;
    this.cvsOff = null;
  },

  /**
   * Return frame offset
   * 返回帧偏移
   * @return {Object}
   * @private
   */
  getFrameOffset(force = 0) {
    if(!this.frmOff || force)
      this.frmOff = this.offset(this.frame.el);
    return this.frmOff;
  },

  /**
   * Return canvas offset
   * 返回帆布偏移
   * @return {Object}
   * @private
   */
  getCanvasOffset() {
    if(!this.cvsOff)
      this.cvsOff = this.offset(this.el);
    return this.cvsOff;
  },

  /**
   * Returns element's data info
   * 返回元素的数据信息
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el, opts) {
    var opt = opts || {};
    var frmOff = this.getFrameOffset();
    var cvsOff = this.getCanvasOffset();
    var eo = this.offset(el);// 获取当前选中的位置

    var frmTop = opt.avoidFrameOffset ? 0 : frmOff.top;
    var frmLeft = opt.avoidFrameOffset ? 0 : frmOff.left;

    var top = eo.top + frmTop - cvsOff.top;
    var left = eo.left + frmLeft - cvsOff.left;
    return {
      top,
      left,
      height: el.offsetHeight,
      width: el.offsetWidth
    };
  },

  /**
   * Returns position data of the canvas element
   * 返回画布元素的位置数据
   * @return {Object} obj Position object
   * @private
   */
  getPosition() {
    var bEl = this.frame.el.contentDocument.body;
    var fo = this.getFrameOffset();
    var co = this.getCanvasOffset();
    return {
      top: fo.top + bEl.scrollTop - co.top,
      left: fo.left + bEl.scrollLeft - co.left
    };
  },

  /**
   * Update javascript of a specific component passed by its View
   * 更新其视图传递的特定组件的JavaScript
   * @param {View} view Component's View
   * @private
   */
  updateScript(view) {
    if(!view.scriptContainer) {
      view.scriptContainer = $('<div>');
      this.getJsContainer().append(view.scriptContainer.get(0));
    }

    var model = view.model;
    var id = model.getId();
    view.el.id = id;
    view.scriptContainer.html('');
    // In editor, I make use of setTimeout as during the append process of elements
    // 在编辑器中，我利用setTimeout的过程中添加元素
    // those will not be available immediatly, therefore 'item' variable
    // 那些不可直接，因此“项”变
    view.scriptContainer.append(`<script>
        setTimeout(function() {
          var item = document.getElementById('${id}');
          if (!item) return;
          (function(){${model.getScriptString()}}.bind(item))()
        }, 1);
      </script>`);
  },

  /**
   * Get javascript container
   * 获取容器
   * @private
   */
  getJsContainer() {
    if (!this.jsContainer) {
      this.jsContainer = $('<div>', {class: this.ppfx + 'js-cont'}).get(0);
    }
    return this.jsContainer;
  },


  render() {
    this.wrapper  = this.model.get('wrapper');

    if(this.wrapper && typeof this.wrapper.render == 'function'){
      this.model.get('frame').set('wrapper', this.wrapper);
      this.$el.append(this.frame.render().el);
      var frame = this.frame;
      if (this.config.scripts.length === 0) {
        frame.el.onload = this.renderBody;
      } else {
        this.renderScripts(); // will call renderBody later 稍后会调用renderBody
      }
    }
    var ppfx = this.ppfx;
    var toolsEl      = $('<div>', { id: ppfx + 'tools' }).get(0);
    this.hlEl        = $('<div>', { class: ppfx + 'highlighter' }).get(0);
    this.badgeEl     = $('<div>', {class: ppfx + 'badge'}).get(0);
    this.placerEl    = $('<div>', {class: ppfx + 'placeholder'}).get(0);
    this.placerIntEl = $('<div>', {class: ppfx + 'placeholder-int'}).get(0);
    this.ghostEl     = $('<div>', {class: ppfx + 'ghost'}).get(0);
    this.toolbarEl   = $('<div>', {class: ppfx + 'toolbar'}).get(0);
    this.resizerEl   = $('<div>', {class: ppfx + 'resizer'}).get(0);
    this.offsetEl    = $('<div>', {class: ppfx + 'offset-v'}).get(0);
    this.fixedOffsetEl = $('<div>', {class: ppfx + 'offset-fixed-v'}).get(0);
    this.placerEl.appendChild(this.placerIntEl);
    toolsEl.appendChild(this.hlEl);
    toolsEl.appendChild(this.badgeEl);
    toolsEl.appendChild(this.placerEl);
    toolsEl.appendChild(this.ghostEl);
    toolsEl.appendChild(this.toolbarEl);
    toolsEl.appendChild(this.resizerEl);
    toolsEl.appendChild(this.offsetEl);
    toolsEl.appendChild(this.fixedOffsetEl);
    this.$el.append(toolsEl);
    var rte = this.em.get('rte');

    if(rte)
      toolsEl.appendChild(rte.render());

    this.toolsEl = toolsEl;
    this.$el.attr({class: this.className});
    return this;
  },

});
