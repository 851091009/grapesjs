var ToolbarView = require('dom_components/view/ToolbarView');
var Toolbar     = require('dom_components/model/Toolbar');
var key         = require('keymaster');
let showOffsets;

module.exports = {

  init(o) {
    _.bindAll(this, 'onHover', 'onOut', 'onClick', 'onKeyPress');
  },


  enable() {
    _.bindAll(this, 'copyComp', 'pasteComp', 'onFrameScroll');
    this.frameOff = this.canvasOff = this.adjScroll = null;
    var config  = this.config.em.get('Config');
    this.startSelectComponent();
    this.toggleClipboard(config.copyPaste);
    var em = this.config.em;
    showOffsets = 1;

    em.on('component:update', this.updateAttached, this);
    em.on('change:canvasOffset', this.updateAttached, this);
    em.on('change:selectedComponent', this.updateToolbar, this);
  },

  /**
   * Toggle clipboard function
   * 切换剪贴板功能
   * @param  {Boolean} active
   * @return {this}
   * @private
   */
  toggleClipboard(active) {
    var en = active || 0;
    if(en){
      key('⌘+c, ctrl+c', this.copyComp);
      key('⌘+v, ctrl+v', this.pasteComp);
    }else{
      key.unbind('⌘+c, ctrl+c');
      key.unbind('⌘+v, ctrl+v');
    }
  },

  /**
   * Copy component to the clipboard
   * 将组件复制到剪贴板
   * @private
   */
  copyComp() {
    var el = this.editorModel.get('selectedComponent');
    if(el && el.get('copyable'))
      this.editorModel.set('clipboard', el);
  },

  /**
   * Paste component from clipboard
   * 从剪贴板粘贴组件
   * @private
   */
  pasteComp() {
    var clp = this.editorModel.get('clipboard'),
        sel = this.editorModel.get('selectedComponent');
    if(clp && sel && sel.collection){
      var index = sel.collection.indexOf(sel),
          clone = clp.clone();
      sel.collection.add(clone, { at: index + 1 });
    }
  },

  /**
   * Returns canavs body el
   */
  getCanvasBodyEl() {
    if(!this.$bodyEl) {
      this.$bodyEl = $(this.getCanvasBody());
    }
    return this.$bodyEl;
  },

  /**
   * Start select component event
   * 开始选择组件事件
   * @private
   * */
  startSelectComponent() {
   this.toggleSelectComponent(1);
  },

  /**
   * Stop select component event
   * 停止选择组件事件
   * @private
   * */
  stopSelectComponent() {
   this.toggleSelectComponent();
  },

  /**
   * Toggle select component event
   * 选择组件事件
   * @private
   * */
  toggleSelectComponent(enable) {
    var el = '*';
    var method = enable ? 'on' : 'off';
    this.getCanvasBodyEl()
      [method]('mouseover', el, this.onHover)
      [method]('mouseout', el, this.onOut)
      [method]('click', el, this.onClick);

    var cw = this.getContentWindow();
    cw[method]('scroll', this.onFrameScroll);
    cw[method]('keydown', this.onKeyPress);
  },

  /**
   * On key press event
   * 论按键事件
   * @private
   * */
  onKeyPress(e) {
    var key = e.which || e.keyCode;
    var comp = this.editorModel.get('selectedComponent');
    var focused = this.frameEl.contentDocument.activeElement.tagName !== 'BODY';

    // On CANC (46) or Backspace (8)
    if(key == 8 || key == 46) {
      if(!focused)
        e.preventDefault();
      if(comp && !focused) {
        if(!comp.get('removable'))
          return;
        comp.set('status','');
        comp.destroy();
        this.hideBadge();
        this.clean();
        this.hideHighlighter();
        this.editorModel.set('selectedComponent', null);
      }
    }
  },

  /**
   * Hover command
   * 悬停的命令
   * @param {Object}  e
   * @private
   */
  onHover(e) {
    e.stopPropagation();
    var trg = e.target;

    // Adjust tools scroll top
    // 调整工具滚动顶部
    if(!this.adjScroll){
      this.adjScroll = 1;
      this.onFrameScroll(e);
      this.updateAttached();
    }

    var pos = this.getElementPos(trg);
    this.updateBadge(trg, pos);
    this.updateHighlighter(trg, pos);
    this.showElementOffset(trg, pos);
  },

  /**
   * Out command
   * 输出命令
   * @param {Object}  e
   * @private
   */
  onOut(e) {
    e.stopPropagation();
    this.hideBadge();
    this.hideHighlighter();
    this.hideElementOffset();
  },

  /**
   * Show element offset viewer
   * 显示元素偏移查看器
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showElementOffset(el, pos) {
    var $el = $(el);
    var model = $el.data('model');

    if ( (model && model.get('status') == 'selected') ||
        !showOffsets){
      return;
    }

    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
    });
  },

  /**
   * Hide element offset viewer
   * 隐藏元素偏移查看器
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideElementOffset(el, pos) {
    this.editor.stopCommand('show-offset');
  },

  /**
   * Show fixed element offset viewer
   * 显示固定元素偏移查看器
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showFixedElementOffset(el, pos) {
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      state: 'Fixed',
    });
  },

  /**
   * Hide fixed element offset viewer
   * 隐藏固定元素偏移查看器
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideFixedElementOffset(el, pos) {
    if(this.editor)
      this.editor.stopCommand('show-offset', {state: 'Fixed'});
  },

  /**
   * Hide Highlighter element
   * 隐藏的元素
   */
  hideHighlighter() {
    this.canvas.getHighlighter().style.display = 'none';
  },

  /**
   * Hover command
   * 悬停的命令
   * @param {Object}  e
   * @private
   */
  onClick(e) {
    var m = $(e.target).data('model');
    if(!m)
      return;
    var s  = m.get('stylable');
    if(!(s instanceof Array) && !s)
      return;
    this.onSelect(e, e.target);
  },

  /**
   * Update badge for the component
   * 更新组件的标记
   * @param {Object} Component
   * @param {Object} pos Position object
   * @private
   * */
  updateBadge(el, pos) {
    var $el = $(el);
    var canvas = this.canvas;
    var config = canvas.getConfig();
    var customeLabel = config.customBadgeLabel;
    this.cacheEl = el;
    var model = $el.data("model");
    if(!model || !model.get('badgable'))
      return;
    var badge = this.getBadge();
    var badgeLabel = model.getIcon() + model.getName();
    badgeLabel = customeLabel ? customeLabel(model) : badgeLabel;
    badge.innerHTML = badgeLabel;
    var bStyle = badge.style;
    var u = 'px';
    bStyle.display = 'block';
    var canvasPos = canvas.getCanvasView().getPosition();
    var badgeH = badge ? badge.offsetHeight : 0;
    var badgeW = badge ? badge.offsetWidth : 0;
    var top = pos.top - badgeH < canvasPos.top ? canvasPos.top : pos.top - badgeH;
    var left = pos.left + badgeW < canvasPos.left ? canvasPos.left : pos.left;
    bStyle.top = top + u;
    bStyle.left = left + u;
  },

  /**
   * Update highlighter element
   * 更新的元素
   * @param {HTMLElement} el
   * @param {Object} pos Position object
   * @private
   */
  updateHighlighter(el, pos) {
    var $el = $(el);
    var model = $el.data('model');
    if(!model || (model && model.get('status') == 'selected')) {
      return;
    }

    var hlEl = this.canvas.getHighlighter();
    var hlStyle = hlEl.style;
    var unit = 'px';
    hlStyle.left = pos.left + unit;
    hlStyle.top = pos.top + unit;
    hlStyle.height = pos.height + unit;
    hlStyle.width = pos.width + unit;
    hlStyle.display = 'block';
  },

  /**
   * Say what to do after the component was selected
   * 在选定组件后，说明该做什么
   * @param {Object}  e
   * @param {Object}  el
   * @private
   * */
  onSelect(e, el) {
    e.stopPropagation();
    var model = $(el).data('model');

    if (model) {
      this.editor.select(model);
      this.showFixedElementOffset(el);
      this.hideElementOffset();
      this.hideHighlighter();
      this.initResize(el);
    }
  },

  /**
   * Init resizer on the element if possible
   * 初始化缩放的元素如果可能的话
   * @param  {HTMLElement} el
   * @private
   */
  initResize(el) {
    var em = this.em;
    var editor = em ? em.get('Editor') : '';
    var config = em ? em.get('Config') : '';
    var pfx = config.stylePrefix || '';
    var attrName = 'data-' + pfx + 'handler';
    var resizeClass = pfx + 'resizing';
    var model = em.get('selectedComponent');
    var resizable = model.get('resizable');
    var options = {};
    var modelToStyle;

    var toggleBodyClass = (method, e, opts) => {
      var handlerAttr = e.target.getAttribute(attrName);
      var resizeHndClass = pfx + 'resizing-' + handlerAttr;
      var classToAdd = resizeClass;// + ' ' +resizeHndClass;
      if (opts.docs) {
        opts.docs.find('body')[method](classToAdd);
      }
    };


    if (editor && resizable) {
      options = {
        onStart(e, opts) {
          toggleBodyClass('addClass', e, opts);
          modelToStyle = em.get('StyleManager').getModelToStyle(model);
          showOffsets = 0;
        },
        // Update all positioned elements (eg. component toolbar)
        // 更新所有已定位的元素（例如组件工具栏）
        onMove() {
          editor.trigger('change:canvasOffset');
        },
        onEnd(e, opts) {
          toggleBodyClass('removeClass', e, opts);
          editor.trigger('change:canvasOffset');
          showOffsets = 1;
        },
        updateTarget(el, rect, options = {}) {
          if (!modelToStyle) {
            return;
          }

          const {store, selectedHandler} = options;
          const onlyHeight = ['tc', 'bc'].indexOf(selectedHandler) >= 0;
          const onlyWidth = ['cl', 'cr'].indexOf(selectedHandler) >= 0;
          const unit = 'px';
          const style = modelToStyle.getStyle();

          if (!onlyHeight) {
            style.width = rect.w + unit;
          }

          if (!onlyWidth) {
            style.height = rect.h + unit;
          }

          modelToStyle.setStyle(style, {avoidStore: 1});
          em.trigger('targetStyleUpdated');

          if (store) {
            modelToStyle.trigger('change:style', modelToStyle, style, {});
          }
        }
      };

      if (typeof resizable == 'object') {
        options = Object.assign(options, resizable);
      }

      editor.runCommand('resize', {el, options});

      // On undo/redo the resizer rect is not updating, need somehow to call
      // 在撤消/重做的缩放矩形不更新，需要设法打电话
      // this.updateRect on undo/redo action
      // this.updaterect对撤销/重做操作
    }
  },

  /**
   * Update toolbar if the component has one
   * 如果组件有一个，更新工具栏
   * @param {Object} mod
   */
  updateToolbar(mod) {
    var em = this.config.em;
    var model = mod == em ? em.get('selectedComponent') : mod;
    if(!model){
      return;
    }
    var toolbar = model.get('toolbar');
    var ppfx = this.ppfx;
    var showToolbar = em.get('Config').showToolbar;
    var toolbarEl = this.canvas.getToolbarEl();
    var toolbarStyle = toolbarEl.style;

    if (showToolbar && toolbar && toolbar.length) {
      toolbarStyle.display = 'flex';
      if(!this.toolbar) {
        toolbarEl.innerHTML = '';
        this.toolbar = new Toolbar(toolbar);
        var toolbarView = new ToolbarView({
          collection: this.toolbar,
          editor: this.editor
        });
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      var view = model.view;

      if(view) {
        this.updateToolbarPos(view.el);
      }
    } else {
      toolbarStyle.display = 'none';
    }
  },

  /**
   * Update toolbar positions
   * 更新工具栏位置
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolbarPos(el, elPos) {
    var unit = 'px';
    var toolbarEl = this.canvas.getToolbarEl();
    var toolbarStyle = toolbarEl.style;
    var pos = this.canvas.getTargetToElementDim(toolbarEl, el, {
      elPos,
      event: 'toolbarPosUpdate',
    });
    var leftPos = pos.left + pos.elementWidth - pos.targetWidth;
    toolbarStyle.top = pos.top + unit;
    toolbarStyle.left = leftPos + unit;
  },

  /**
   * Return canvas dimensions and positions
   * 返回的尺寸和位置帆布
   * @return {Object}
   */
  getCanvasPosition() {
    return this.canvas.getCanvasView().getPosition();
  },

  /**
   * Removes all highlighting effects on components
   * 删除组件上的所有突出显示效果。
   * @private
   * */
  clean() {
    if(this.selEl)
      this.selEl.removeClass(this.hoverClass);
  },

  /**
   * Returns badge element
   * 归来的徽章的元素
   * @return {HTMLElement}
   * @private
   */
  getBadge() {
    return this.canvas.getBadgeEl();
  },

  /**
   * On frame scroll callback
   * 在帧滚动回调
   * @private
   */
  onFrameScroll(e) {
    var el = this.cacheEl;
    if (el) {
      var elPos = this.getElementPos(el);
      this.updateBadge(el, elPos);
      var model = this.em.get('selectedComponent');

      if (model) {
        this.updateToolbarPos(model.view.el);
      }
    }
  },

  /**
   * Update attached elements, eg. component toolbar
   * 更新附属元素，例如组件工具栏
   * @return {[type]} [description]
   */
  updateAttached() {
    var model = this.em.get('selectedComponent');
    if (model) {
      var view = model.view;
      this.updateToolbarPos(view.el);
      this.showFixedElementOffset(view.el);
    }
  },

  /**
   * Returns element's data info
   * 返回元素的数据信息
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el, badge) {
    return this.canvas.getCanvasView().getElementPos(el);
  },

  /**
   * Hide badge
   * 隐藏的徽章
   * @private
   * */
  hideBadge() {
    this.getBadge().style.display = 'none';
  },

  /**
   * Clean previous model from different states
   * 从不同的状态清除以前的模型
   * @param {Component} model
   * @private
   */
  cleanPrevious(model) {
    if(model)
      model.set({
        status: '',
        state: '',
      });
  },

  /**
   * Returns content window
   * 返回内容窗口
   * @private
   */
  getContentWindow() {
    if(!this.contWindow)
      this.contWindow = $(this.frameEl.contentWindow);
    return this.contWindow;
  },

  run(editor) {
    this.editor = editor && editor.get('Editor');
    this.enable();
  },

  stop() {
    this.stopSelectComponent();
    this.cleanPrevious(this.em.get('selectedComponent'));
    this.clean();
    this.em.set('selectedComponent', null);
    this.toggleClipboard();
    this.hideBadge();
    this.hideFixedElementOffset();
    this.canvas.getToolbarEl().style.display = 'none';

    this.em.off('component:update', this.updateAttached, this);
    this.em.off('change:canvasOffset', this.updateAttached, this);
    this.em.off('change:selectedComponent', this.updateToolbar, this);
  }
};
