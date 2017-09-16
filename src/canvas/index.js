module.exports = () => {
  var c = {},
  defaults   = require('./config/config'),
  Canvas     = require('./model/Canvas'),
  CanvasView = require('./view/CanvasView');
  var canvas;
  var frameRect;

  return {

    /**
     * Used inside RTE
     * 在RTE内部使用
     * @private
     */
    getCanvasView() {
      return CanvasView;
    },

    /**
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'Canvas',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块。使用编辑器的新实例自动调用
     * @param {Object} config Configurations
     */
    init(config) {
      c = config || {};
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      canvas = new Canvas(config);
      CanvasView	= new CanvasView({
        model: canvas,
        config: c,
      });

      var cm = c.em.get('DomComponents');
      if(cm)
        this.setWrapper(cm);

      this.startAutoscroll = this.startAutoscroll.bind(this);
      this.stopAutoscroll  = this.stopAutoscroll.bind(this);
      this.autoscroll      = this.autoscroll.bind(this);
      return this;
    },

    /**
     * Return config object
     * 返回的配置对象
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Add wrapper
     * 添加包装
     * @param	{Object}	wrp Wrapper
     *
     * */
    setWrapper(wrp) {
      canvas.set('wrapper', wrp);
    },

    /**
     * Returns canvas element
     * 返回canvas元素
     * @return {HTMLElement}
     */
    getElement() {
      return CanvasView.el;
    },

    /**
     * Returns frame element of the canvas
     * 返回画布的框架元素
     * @return {HTMLElement}
     */
    getFrameEl() {
      return CanvasView.frame.el;
    },

    /**
     * Returns body element of the frame
     * 返回框架的主体元素
     * @return {HTMLElement}
     */
    getBody() {
      return CanvasView.frame.el.contentDocument.body;
    },

    /**
     * Returns body wrapper element of the frame
     * 返回框架的包装器元素。
     * @return {HTMLElement}
     */
    getWrapperEl() {
      return this.getBody().querySelector('#wrapper');
    },

    /**
     * Returns element containing canvas tools
     * 返回包含画布工具的元素
     * @return {HTMLElement}
     */
    getToolsEl() {
      return CanvasView.toolsEl;
    },

    /**
     * Returns highlighter element
     * 返回的元素
     * @return {HTMLElement}
     */
    getHighlighter() {
      return CanvasView.hlEl;
    },

    /**
     * Returns badge element
     * 归来的徽章的元素
     * @return {HTMLElement}
     */
    getBadgeEl() {
      return CanvasView.badgeEl;
    },

    /**
     * Returns placer element
     * 返回砂元
     * @return {HTMLElement}
     */
    getPlacerEl() {
      return CanvasView.placerEl;
    },

    /**
     * Returns ghost element
     * @return {HTMLElement}
     * @private
     */
    getGhostEl() {
      return CanvasView.ghostEl;
    },

    /**
     * Returns toolbar element
     * 返回工具栏元
     * @return {HTMLElement}
     */
    getToolbarEl() {
      return CanvasView.toolbarEl;
    },

    /**
     * Returns resizer element
     * 返回缩放元素
     * @return {HTMLElement}
     */
    getResizerEl() {
      return CanvasView.resizerEl;
    },

    /**
     * Returns offset viewer element
     * 返回偏移查看器元素
     * @return {HTMLElement}
     */
    getOffsetViewerEl() {
      return CanvasView.offsetEl;
    },

    /**
     * Returns fixed offset viewer element
     * 返回固定偏移查看器元素
     * @return {HTMLElement}
     */
    getFixedOffsetViewerEl() {
      return CanvasView.fixedOffsetEl;
    },

    /**
     * Render canvas
     * 渲染画布
     * */
    render() {
      return CanvasView.render().el;
    },

    /**
     * Get frame position
     * 获取画布的位置
     * @return {Object}
     * @private
     */
    getOffset() {
      var frameOff = this.offset(this.getFrameEl());
      var canvasOff = this.offset(this.getElement());
      return {
        top: frameOff.top - canvasOff.top,
        left: frameOff.left - canvasOff.left
      };
    },

    /**
    * Get the offset of the element
    * 获取元素的偏移量。
    * @param  {HTMLElement} el
    * @return {Object}
    * @private
    */
    offset(el) {
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };
    },

    /**
     * Set custom badge naming strategy
     * 设置自定义标记命名策略
     * @param  {Function} f
     * @example
     * canvas.setCustomBadgeLabel(function(model){
     *  return ComponentModel.getName();
     * });
     */
    setCustomBadgeLabel(f) {
      c.customBadgeLabel = f;
    },

    /**
     * Get element position relative to the canvas
     * 获取相对于画布的元素位置
     * @param {HTMLElement} el
     * @return {Object}
     */
    getElementPos(el, opts) {
      return CanvasView.getElementPos(el, opts);
    },

    /**
     * This method comes handy when you need to attach something like toolbars
     * to elements inside the canvas, dealing with all relative position,
     * offsets, etc. and returning as result the object with positions which are
     * viewable by the user (when the canvas is scrolled the top edge of the element
     * is not viewable by the user anymore so the new top edge is the one of the canvas)
     *
     * 当你需要附加工具栏之类的东西时，这个方法就很方便了。
     * 画布中的元素，处理所有的相对位置，
     * 偏移量等，并返回具有位置的物体。
     * 由用户可视（当画布滚动元件的顶部边缘
     * 用户不再可见，所以新的顶部边缘是画布的一个）
     * 
     * The target should be visible before being passed here as invisible elements
     * 在通过这里作为不可见元素之前，目标应该是可见的
     * return empty string as width
     * 将空字符串作为宽度返回
     * @param {HTMLElement} target The target in this case could be the toolbar
     * @param {HTMLElement} element The element on which I'd attach the toolbar
     * @param {Object} options Custom options
     * @param {Boolean} options.toRight Set to true if you want the toolbar attached to the right
     * @return {Object}
     */
    getTargetToElementDim(target, element, options) {
      var opts = options || {};
      var canvasPos = CanvasView.getPosition();
      var pos = opts.elPos || CanvasView.getElementPos(element);
      var toRight = options.toRight || 0;
      var targetHeight = opts.targetHeight || target.offsetHeight;
      var targetWidth = opts.targetWidth || target.offsetWidth;
      var eventToTrigger = opts.event || null;

      var elTop = pos.top - targetHeight;
      var elLeft = pos.left;
      elLeft += toRight ? pos.width : 0;
      elLeft = toRight ? (elLeft - targetWidth) : elLeft;

      var leftPos = elLeft < canvasPos.left ? canvasPos.left : elLeft;
      var topPos = elTop < canvasPos.top ? canvasPos.top : elTop;
      topPos = topPos > (pos.top + pos.height) ? (pos.top + pos.height) : topPos;

      var result = {
        top: topPos,
        left: leftPos,
        elementTop: pos.top,
        elementLeft: pos.left,
        elementWidth: pos.width,
        elementHeight: pos.height,
        targetWidth: target.offsetWidth,
        targetHeight: target.offsetHeight,
        canvasTop: canvasPos.top,
        canvasLeft: canvasPos.left,
      };

      // In this way I can catch data and also change the position strategy
      // 这样我就可以捕捉数据，也可以改变位置策略。
      if(eventToTrigger && c.em) {
        c.em.trigger(eventToTrigger, result);
      }

      return result;
    },

    /**
     * Instead of simply returning e.clientX and e.clientY this function
     * calculates also the offset based on the canvas. This is helpful when you
     * need to get X and Y position while moving between the editor area and
     * canvas area, which is in the iframe
     * 
     *而不是简单地返回e.clientx和e.clienty这个功能
     *计算基于画布的偏移量。这对你很有帮助。
     *需要在编辑器区域之间移动时获得x和y位置。
     *画布区域，这是在iframe
     *
     * @param {Event} e
     * @return {Object}
     */
    getMouseRelativePos(e, options) {
      var opts = options || {};
      var addTop = 0;
      var addLeft = 0;
      var subWinOffset = opts.subWinOffset;
      var doc = e.target.ownerDocument;
      var win = doc.defaultView || doc.parentWindow;
      var frame = win.frameElement;
      var yOffset = subWinOffset ? win.pageYOffset : 0;
      var xOffset = subWinOffset ? win.pageXOffset : 0;

      if (frame) {
        var frameRect = frame.getBoundingClientRect();
        addTop = frameRect.top || 0;
        addLeft = frameRect.left || 0;
      }

      return {
        y: e.clientY + addTop - yOffset,
        x: e.clientX + addLeft - xOffset,
      };
    },

    /**
     * X and Y mouse position relative to the canvas
     * 相对于画布的x和y鼠标位置
     * @param {Event} e
     * @return {Object}
     */
    getMouseRelativeCanvas(e, options) {
      var opts = options || {};
      var frame = this.getFrameEl();
      var body = this.getBody();
      var addTop = frame.offsetTop || 0;
      var addLeft = frame.offsetLeft || 0;
      var yOffset = body.scrollTop || 0;
      var xOffset = body.scrollLeft || 0;

      return {
        y: e.clientY + addTop + yOffset,
        x: e.clientX + addLeft + xOffset,
      };
    },

    /**
     * Start autoscroll
     * 开始自动滚屏
     */
    startAutoscroll() {
      this.dragging = 1;
      let toListen = this.getScrollListeners();
      frameRect = CanvasView.getFrameOffset(1);
      toListen.on('mousemove', this.autoscroll);
      toListen.on('mouseup', this.stopAutoscroll);
    },

    autoscroll(e) {
      e.preventDefault();
      if (this.dragging) {
        let frameWindow = this.getFrameEl().contentWindow;
        let actualTop = frameWindow.document.body.scrollTop;
        let nextTop = actualTop;
        let clientY = e.clientY;
        let limitTop = 50;
        let limitBottom = frameRect.height - limitTop;

        if (clientY < limitTop) {
          nextTop -= (limitTop - clientY);
        }

        if (clientY > limitBottom) {
          nextTop += (clientY - limitBottom);
        }

        //console.log(`actualTop: ${actualTop} clientY: ${clientY} nextTop: ${nextTop} frameHeigh: ${frameRect.height}`);
        frameWindow.scrollTo(0, nextTop);
      }
    },

    /**
     * Stop autoscroll
     * 停止自动滚屏
     */
    stopAutoscroll() {
      this.dragging = 0;  
      let toListen = this.getScrollListeners();
      toListen.off('mousemove', this.autoscroll);
      toListen.off('mouseup', this.stopAutoscroll);
    },

    getScrollListeners() {
      if (!this.scrollListeners) {
        this.scrollListeners =
          $(this.getFrameEl().contentWindow, this.getElement());
      }

      return this.scrollListeners;
    },

    /**
     * Returns wrapper element
     * 返回包装元素
     * @return {HTMLElement}
     * ????
     */
    getFrameWrapperEl() {
      return CanvasView.frame.getWrapper();
    },
  };
};
