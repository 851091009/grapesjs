var getBoundingRect = (el, win) => {
  var w = win || window;
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + w.pageXOffset,
    top: rect.top + w.pageYOffset,
    width: rect.width,
    height: rect.height
  };
};

module.exports = {

  // TODO move to opts
  // TODO转向选择
  setKey(keys, command) {
    //key(keys, command);
  },

  /**
   * Return element position
   * 返回元素位置
   * @param  {HTMLElement} el
   * @return {Object}
   */
  getElementRect(el) {
    var posFetcher = this.opts.posFetcher || '';
    return posFetcher ? posFetcher(el, {
      avoidFrameOffset: 1,
    }) : getBoundingRect(el);
  },

  /**
   * Init the resizer
   * 启动resizer
   * @param  {Object} opts
   */
  init(opts) {
    this.setOptions(opts);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.drag = this.drag.bind(this);
    this.move = this.move.bind(this);
    this.stop = this.stop.bind(this);
    this.setKey('up, right, down, left', this.handleKey);
    return this;
  },

  /**
   * Update options
   * 更新选项
   * @param {Object} options
   */
  setOptions(opts) {
    this.opts = opts || {};
  },

  /**
   * Focus dragger on the element
   * 将元素上的焦点拖放
   * @param {HTMLElement} el
   */
  focus(el) {
    // Avoid focusing on already focused element
    // 避免关注已经聚焦的元素
    if (el && el === this.el) {
      return;
    }

    this.getDocumentEl(el);
    this.blur();
    this.el = el;
    this.handlers = this.opts.dragHandlers || [el];


    var elRect = this.getElementRect(el); //<-- TODO have wrong top:left
    this.elRect = elRect;
    this.startTop = elRect.top;
    this.startLeft = elRect.left;

    // TODO init snapper
    // TODO init snapper

		this.getDocumentEl().on('mousedown', this.handleMouseDown);
  },

  /**
   * Blur from the focused element
   * 模糊从聚焦的元素
   */
  blur() {
    this.getDocumentEl().off('mousedown', this.handleMouseDown);
    this.el = null;
  },

  /**
   * Start dragging
   * 开始拖动
   * @param  {Event} e
   */
  start(e) {
    this.startPos = this.getMousePos(e);
    var docs = this.getDocumentEl();
    docs.on('mousemove', this.drag);
    docs.on('mouseup', this.stop);

    // Start callback
    // 开始回调
    var onStart = this.opts.onStart;
    if(typeof onStart === 'function') {
      onStart(e, {
        docs,
        el: this.el,
        start: this.startPos,
        elRect: this.elRect,
      });
    }

    this.drag(e);
  },

  /**
   * Stop dragging
   * 停止拖动
   */
  stop(e) {
    var docs = this.getDocumentEl();
    docs.off('mousemove', this.drag);
    docs.off('mouseup', this.stop);
    this.lockedAxis = null;

    // Stop callback
    // 停止回调
    var onEnd = this.opts.onEnd;
    if(typeof onEnd === 'function') {
      onEnd(e, {
        docs,
        delta: this.delta,
        end: {
          x: this.startLeft + this.delta.x,
          y: this.startTop + this.delta.y,
        }
      });
    }
  },

  /**
   * Handle mousedown to check if it's possible to drag
   * 处理mousedown以检查是否可以拖动
   * @param  {Event} e
   */
  handleMouseDown(e) {
    var el = e.target;
    if (this.isHandler(el)) {
      this.start(e);
    }
  },

  /**
   * Detects if the clicked element is a valid handler
   * 检测点击的元素是否是有效的处理程序
   * @param  {HTMLElement} el
   * @return {Boolean}
   */
  isHandler(el) {
    var handlers = this.handlers;

    for (var n in handlers) {
      if (handlers[n] === el) return true;
    }

    return false;
  },

  /**
   * Handle key press
   * 手柄按键
   * @param  {Event} e
   * @param  {Object} handler
   */
  handleKey(e, handler) {
    switch (handler.shortcut) {
      case 'up':
        this.move(0, -1);
        break;
      case 'right':
        this.move(1, 0);
        break;
      case 'down':
        this.move(0, 1);
        break;
      case 'left':
        this.move(-1, 0);
        break;
    }
  },

  /**
   * Returns documents
   * 退回文件
   */
  getDocumentEl(el) {
    var el = el || this.el;
    if (!this.$doc) {
      var docs = [document];
      if (el) {
        docs.push(el.ownerDocument);
      }
      this.$doc = $(docs);
    }
    return this.$doc;
  },

  /**
   * Get mouse coordinates
   * 获取鼠标坐标
   * @param  {Event} event
   * @return {Object}
   */
  getMousePos(e) {
    var mouseFetch = this.opts.mousePosFetcher;
    return mouseFetch ? mouseFetch(e) : {
      x: e.clientX,
      y: e.clientY
    };
  },

  /**
   * Drag event
   * 拖动事件
   * @param  {Event} event
   */
  drag(e) {
    var lockedAxis = this.lockedAxis;
    var currentPos = this.getMousePos(e);
    var delta = {
      x: currentPos.x - this.startPos.x,
      y: currentPos.y - this.startPos.y
    };
    // Lock one axis
    // 锁定一个轴
    if (e.shiftKey) {
      if (!lockedAxis) {
        var relX = delta.x;
        var relY = delta.y;
        var absX = Math.abs(relX);
        var absY = Math.abs(relY);

        // Vertical or Horizontal lock
        // 垂直或水平锁
        if (relY >= absX || relY <= -absX) {
          lockedAxis = 'x';
        } else if (relX > absY || relX < -absY) {
          lockedAxis = 'y';
        }
      }
    } else {
      lockedAxis = null;
    }

    if (lockedAxis === 'x') {
      delta.x = this.startPos.x;
    }

    if (lockedAxis === 'y') {
      delta.y = this.startPos.y;
    }

    this.lockedAxis = lockedAxis;
    this.delta = delta;
    this.move(delta.x, delta.y);

    // Drag callback
    // 拖动回调
    const onDrag = this.opts.onDrag;
    if(typeof onDrag === 'function') {
      onDrag(e, {
        delta,
        current: {
          x: this.startLeft + delta.x,
          y: this.startTop + delta.y
        },
        lockedAxis
      });
    }

    // In case the mouse button was released outside of the window
    // 万一鼠标按钮被释放到窗外
    if (e.which === 0) {
      this.stop(e);
    }
  },

  /**
   * Move the element
   * 移动元素
   * @param  {integer} x
   * @param  {integer} y
   */
  move: function(x, y) {
    this.moveX(x);
    this.moveY(y);
  },

  /**
   * Move in x direction
   * 沿x方向移动
   * @param  {integer} x
   */
  moveX(x) {
    var el = this.el;
    var opts = this.opts;
    var xPos = this.startLeft + x;
    const setX = this.opts.setX;

    if (typeof setX === 'function') {
      setX(xPos, {
        el,
        start: this.startLeft,
        delta: x,
      });
    } else {
      el.style.left =  xPos + 'px';
    }
  },

  /**
   * Move in y direction
   * 沿y方向移动
   * @param  {integer} y
   */
  moveY(y) {
    var el = this.el;
    var opts = this.opts;
    var yPos = this.startTop + y;
    const setY = this.opts.setY;

    if (typeof setY === 'function') {
      setY(yPos, {
        el,
        start: this.startTop,
        delta: y,
      });
    } else {
      el.style.top =  yPos + 'px';
    }
  },

};
