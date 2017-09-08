// 拖拽
var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  initialize(opt) {
    this.opt = opt || {};
    _.bindAll(this,'startSort','onMove','endMove','rollback', 'udpateOffset', 'moveDragHelper');
    var o = opt || {};
    this.elT = 0;
    this.elL = 0;
    this.borderOffset = o.borderOffset || 10;

    var el = o.container;
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.$el = $(this.el);

    this.containerSel = o.containerSel || 'div';
    this.itemSel = o.itemSel || 'div';
    this.draggable = o.draggable || true;
    this.nested = o.nested || 0;
    this.pfx = o.pfx || '';
    this.ppfx = o.ppfx || '';
    this.freezeClass = o.freezeClass || this.pfx + 'freezed';
    this.onStart = o.onStart || '';
    this.onEndMove = o.onEndMove || '';
    this.direction = o.direction || 'v'; // v (vertical), h (horizontal), a (auto)
    this.onMoveClb = o.onMove || '';
    this.relative = o.relative || 0;
    this.ignoreViewChildren = o.ignoreViewChildren || 0;
    this.ignoreModels = o.ignoreModels || 0;
    this.plh = o.placer || '';
    // Frame offset 帧偏移
    this.wmargin = o.wmargin || 0;
    this.offTop = o.offsetTop || 0;
    this.offLeft = o.offsetLeft || 0;
    this.document = o.document || document;
    this.$document = $(this.document);
    this.dropContent = null;
    this.em = o.em || '';
    this.dragHelper = null;
    this.canvasRelative = o.canvasRelative || 0;
    this.selectOnEnd = !o.avoidSelectOnEnd;

    if(this.em && this.em.on){
      this.em.on('change:canvasOffset', this.udpateOffset);
      this.udpateOffset();
    }
  },

  getContainerEl() {
    if (!this.el) {
      var el = this.opt.container;
      this.el = typeof el === 'string' ? document.querySelector(el) : el;
      this.$el = $(this.el);
    }
    return this.el;
  },

  /**
   * Triggered when the offset of the editro is changed
   * 当编辑器的偏移改变时触发
   */
  udpateOffset() {
    var offset = this.em.get('canvasOffset');
    this.offTop = offset.top;
    this.offLeft = offset.left;
  },

  /**
   * Set content to drop
   * 设置内容下降
   * @param {String|Object} content
   */
  setDropContent(content) {
    this.dropContent = content;
  },

  /**
   * Toggle cursor while sorting
   * 在排序时切换光标
   * @param {Boolean} active
   */
  toggleSortCursor(active) {
    var em = this.em;
    var body = document.body;
    var pfx = this.ppfx || this.pfx;
    var sortCls = pfx + 'grabbing';
    var emBody = em ? em.get('Canvas').getBody() : '';
    if(active) {
      em && em.get('Canvas').startAutoscroll();
      body.className += ' ' + sortCls;
      if(em) {
        emBody.className += ' ' + sortCls;
      }
    } else {
      em && em.get('Canvas').stopAutoscroll();
      body.className = body.className.replace(sortCls, '').trim();
      if(em) {
        emBody.className = emBody.className.replace(sortCls, '').trim();
      }
    }
  },

  /**
   * Set drag helper
   * 设置拖拽助手
   * @param {HTMLElement} el
   * @param {Event} event
   */
  setDragHelper(el, event) {
    var ev = event || '';
    var clonedEl = el.cloneNode(1);

    // Attach style
    // 附上风格
    var style = '';
    var o = getComputedStyle(el);
    for(var i = 0; i < o.length; i++) {
      style += o[i] + ':' + o.getPropertyValue(o[i])+';';
    }
    clonedEl.setAttribute('style', style);
    clonedEl.className += ' ' + this.pfx + 'bdrag';
    document.body.appendChild(clonedEl);
    this.dragHelper = clonedEl;

    if(ev) {
      this.moveDragHelper(ev);
    }

    // Listen mouse move events
    // 听鼠标移动事件
    if(this.em) {
      $(this.em.get('Canvas').getBody().ownerDocument)
        .off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
    }
    $(document)
      .off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
  },

  /**
   * //TODO Refactor, use canvas.getMouseRelativePos to get mouse's X and Y
   * TODO Refactor，使用canvas.getMouseRelativePos获取鼠标的X和Y
   * Update the position of the helper
   * 更新助手的位置
   * @param  {Event} e
   */
  moveDragHelper(e) {
    var doc = e.target.ownerDocument;

    if(!this.dragHelper || !doc) {
      return;
    }

    var win = doc.defaultView || doc.parentWindow;
    var addTop = 0;
    var addLeft = 0;
    var frame = win.frameElement;
    if(frame) {
      var frameRect = frame.getBoundingClientRect(); // maybe to cache ?!?
      addTop = frameRect.top || 0;
      addLeft = frameRect.left || 0;
    }
    var hStyle = this.dragHelper.style;
    hStyle.left = (e.pageX - win.pageXOffset + addLeft) + 'px';
    hStyle.top = (e.pageY - win.pageYOffset + addTop) + 'px';
  },


  /**
   * Returns true if the element matches with selector
   * 如果元素与选择器匹配，则返回true
   * @param {Element} el
   * @param {String} selector
   * @return {Boolean}
   */
  matches(el, selector, useBody) {
    var startEl = el.parentNode || document.body;
    //startEl = useBody ? startEl.ownerDocument.body : startEl;
    var els = startEl.querySelectorAll(selector);
    var i = 0;
    while (els[i] && els[i] !== el)
      ++i;
    return !!els[i];
  },

  /**
   * Closest parent
   * 最近的父类
   * @param {Element} el
   * @param {String} selector
   * @return {Element|null}
   */
  closest(el, selector) {
    if(!el)
      return;
    var elem = el.parentNode;
    while (elem && elem.nodeType === 1) {
      if (this.matches(elem, selector))
        return elem;
      elem = elem.parentNode;
    }
    return null;
  },

  /**
   * Get the offset of the element
   * 获取元素的偏移量
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el) {
    var rect = el.getBoundingClientRect();
    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft
    };
  },

  /**
   * Create placeholder
   * 创建占位符
   * @return {HTMLElement}
   */
  createPlaceholder() {
    var pfx = this.pfx;
    var el = document.createElement('div');
    var ins = document.createElement('div');
    el.className = pfx + 'placeholder';
    el.style.display = 'none';
    el.style['pointer-events'] = 'none';
    ins.className = pfx + "placeholder-int";
    el.appendChild(ins);
    return el;
  },

  /**
   * Picking component to move
   * 挑选组件移动
   * @param {HTMLElement} src
   * */
  startSort(src) {
    this.dropModel = null;
    this.moved = 0;
    //this.$document = $([document, trg.ownerDocument]);

    if(src && !this.matches(src, this.itemSel + ',' + this.containerSel))
      src = this.closest(src, this.itemSel);

    this.eV = src;

    // Create placeholder if not exists
    // 创建占位符（如果不存在）
    if (!this.plh) {
      this.plh = this.createPlaceholder();
      this.getContainerEl().appendChild(this.plh);
    }

    if (src) {
      var srcModel = this.getSourceModel();
      srcModel && srcModel.set && srcModel.set('status', 'freezed');
      this.$document.on('mouseup', this.endMove);
    }

    this.$el.on('mousemove', this.onMove);
    $(document).on('keydown', this.rollback);
    this.$document.on('keydown', this.rollback);

    if(typeof this.onStart === 'function')
      this.onStart();

    // Avoid strange effects on dragging
    // 避免对拖动产生奇怪的影响
    if(this.em) {
      this.em.clearSelection();
    }

    this.toggleSortCursor(1);
  },

  /**
   * Get the model from HTMLElement target
   * 从HTMLElement目标获取模型
   * @return {Model|null}
   */
  getTargetModel(el) {
    let elem = el || this.target;
    return $(elem).data('model');
  },

  /**
   * Get the model of the current source element (element to drag)
   * 获取当前源元素的模型（要拖动的元素）
   * @return {Model}
   */
  getSourceModel() {
    var src = this.eV;
    let dropContent = this.dropContent;
    let dropModel = this.dropModel;
    const em = this.em;

    if (dropContent && em) {
      if (!dropModel) {
        let comps = em.get('DomComponents').getComponents();
        let tempModel = comps.add(dropContent, {avoidUpdateStyle: 1, temporary: 1});
        dropModel = comps.remove(tempModel, {temporary: 1});
        this.dropModel = dropModel instanceof Array ? dropModel[0] : dropModel;
      }
      return dropModel;
    }

    if (src) {
      return $(src).data('model');
    }
  },

  /**
   * Highlight target
   * 突出显示目标
   * @param  {Model|null} model
   */
  selectTargetModel(model) {
    if (model instanceof Backbone.Collection) {
      return;
    }

    var prevModel = this.targetModel;
    if (prevModel) {
      prevModel.set('status', '');
    }

    if (model && model.set) {
      model.set('status', 'selected-parent');
      this.targetModel = model;
    }
  },

  /**
   * During move
   * 在移动期间
   * @param {Event} e
   * */
  onMove(e) {
    this.moved = 1;

    // Turn placeholder visibile
    // 转动占位符可见
    var plh = this.plh;
    var dsp = plh.style.display;
    if(!dsp || dsp === 'none')
      plh.style.display = 'block';

    // Cache all necessary positions
    // 缓存所有必要的位置
    var eO = this.offset(this.el);
    this.elT = this.wmargin ? Math.abs(eO.top) : eO.top;
    this.elL = this.wmargin ? Math.abs(eO.left): eO.left;
    var rY = (e.pageY - this.elT) + this.el.scrollTop;
    var rX = (e.pageX - this.elL) + this.el.scrollLeft;

    if (this.canvasRelative && this.em) {
      var mousePos = this.em.get('Canvas').getMouseRelativeCanvas(e);
      rX = mousePos.x;
      rY = mousePos.y;
    }

    var dims = this.dimsFromTarget(e.target, rX, rY);

    let targetModel = this.getTargetModel(this.target);
    this.selectTargetModel(targetModel);

    this.lastDims = dims;
    var pos = this.findPosition(dims, rX, rY);
    // If there is a significant changes with the pointer
    // 如果指针有重大变化
    if( !this.lastPos ||
        (this.lastPos.index != pos.index || this.lastPos.method != pos.method)){
      this.movePlaceholder(this.plh, dims, pos, this.prevTargetDim);
      if(!this.$plh)
        this.$plh = $(this.plh);

      // With canvasRelative the offset is calculated automatically for
      // 使用canvasRelative自动计算偏移量
      // each element
      // 每个元素
      if (!this.canvasRelative) {
        if(this.offTop)
          this.$plh.css('top', '+=' + this.offTop + 'px');
        if(this.offLeft)
          this.$plh.css('left', '+=' + this.offLeft + 'px');
      }

      this.lastPos = pos;
    }

    if(typeof this.onMoveClb === 'function')
      this.onMoveClb(e);
  },

  /**
   * Returns true if the elements is in flow, so is not in flow where
   * 如果元素在流中，则返回true，因此不在流中
   * for example the component is with float:left
   * 例如组件是float：left
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   * */
  isInFlow(el, parent) {
      if(!el)
        return false;

      parent = parent || document.body;
      var ch = -1, h;
      var elem = el;
      h = elem.offsetHeight;
      if (/*h < ch || */!this.styleInFlow(elem, parent))
        return false;
      else
        return true;
  },

  /**
   * Check if el has style to be in flow
   * 检查是否有风格流动
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   */
  styleInFlow(el, parent) {
    var style = el.style;
    var $el = $(el);
    if (style.overflow && style.overflow !== 'visible')
        return;
    if ($el.css('float') !== 'none')
        return;
    if(parent && $(parent).css('display') == 'flex')
      return;
    switch (style.position) {
        case 'static': case 'relative': case '':
            break;
        default:
            return;
    }
    switch (el.tagName) {
        case 'TR': case 'TBODY': case 'THEAD': case 'TFOOT':
            return true;
    }
    switch ($el.css('display')) {
        case 'block':
        case 'list-item':
        case 'table':
        case 'flex':
            return true;
    }
    return;
  },

  /**
   * Check if the target is valid with the actual source
   * 检查目标是否与实际源有效
   * @param  {HTMLElement} trg
   * @return {Boolean}
   */
  validTarget(trg) {
    let srcModel = this.getSourceModel();
    let src = srcModel && srcModel.view && srcModel.view.el;
    let trgModel = this.getTargetModel(trg);
    trg = trgModel && trgModel.view && trgModel.view.el;
    let result = {
      valid: true,
      src,
      srcModel,
      trg,
      trgModel
    };

    if (!src || !trg) {
      result.valid = false;
      return result;
    }

    // Check if the target could accept the source
    // 检查目标是否可以接受源
    let droppable = trgModel.get('droppable');
    droppable = droppable instanceof Backbone.Collection ? 1 : droppable;
    droppable = droppable instanceof Array ? droppable.join(', ') : droppable;
    result.dropInfo = droppable;
    droppable = typeof droppable === 'string' ? src.matches(droppable) : droppable;
    result.droppable = droppable;

    // check if the source is draggable in target
    // 检查源是否可以在目标中拖动
    let draggable = srcModel.get('draggable');
    draggable = draggable instanceof Array ? draggable.join(', ') : draggable;
    result.dragInfo = draggable;
    draggable = typeof draggable === 'string' ? trg.matches(draggable) : draggable;
    result.draggable = draggable;

    if (!droppable || !draggable) {
      result.valid = false;
    }

    return result;
  },

  /**
   * Get dimensions of nodes relative to the coordinates
   * 获取节点相对于坐标的尺寸
   * @param  {HTMLElement} target
   * @param {number} rX Relative X position 相对X位
   * @param {number} rY Relative Y position 相对Y位置
   * @return {Array<Array>}
   */
  dimsFromTarget(target, rX, rY) {
    var dims = [];

    if (!target) {
      return dims;
    }

    // Select the first valuable target
    // 选择第一个有价值的目标
    if (!target.matches(`${this.itemSel}, ${this.containerSel}`)) {
      target = this.closest(target, this.itemSel);
    }

    // If draggable is an array the target will be one of those
    // 如果draggable是数组，则目标将是其中之一
    if (this.draggable instanceof Array) {
      target = this.closest(target, this.draggable.join(','));
    }

    if (!target) {
      return dims;
    }

    // Check if the target is different from the previous one
    // 检查目标是否与上一个不同
    if (this.prevTarget && this.prevTarget != target) {
        this.prevTarget = null;
    }

    // New target found
    // 发现新目标
    if (!this.prevTarget) {
      this.targetP = this.closest(target, this.containerSel);

      // Check if the source is valid with the target
      // 检查源是否与目标有效
      let validResult = this.validTarget(target);
      if (!validResult.valid && this.targetP) {
        return this.dimsFromTarget(this.targetP, rX, rY);
      }

      this.prevTarget = target;
      this.prevTargetDim = this.getDim(target);
      this.cacheDimsP = this.getChildrenDim(this.targetP);
      this.cacheDims = this.getChildrenDim(target);
    }

    // If the target is the previous one will return the cached dims
    // 如果目标是前一个，将返回缓存的暗点
    if(this.prevTarget == target)
      dims = this.cacheDims;

    // Target when I will drop element to sort
    // 当我将要删除元素进行排序时定位
    this.target = this.prevTarget;

    // Generally also on every new target the poiner enters near
    // 一般也是每个新的目标，先锋中心附近
    // to borders, so have to to check always
    // 到边界，所以必须总是检查
    if(this.nearBorders(this.prevTargetDim, rX, rY) ||
       (!this.nested && !this.cacheDims.length)) {
        if (!this.validTarget(this.targetP).valid) {
          return this.dimsFromTarget(this.targetP, rX, rY);
        }
        dims = this.cacheDimsP;
        this.target = this.targetP;
    }

    this.lastPos = null;
    return dims;
  },

  /**
   * Returns dimensions and positions about the element
   * 返回关于元素的尺寸和位置
   * @param {HTMLElement} el
   * @return {Array<number>}
   */
  getDim(el) {
    var top, left, height, width;

    if (this.canvasRelative && this.em) {
      var pos = this.em.get('Canvas').getElementPos(el);
      var styles = window.getComputedStyle(el);
      var marginTop = parseFloat(styles['marginTop']);
      var marginBottom = parseFloat(styles['marginBottom']);
      var marginRight = parseFloat(styles['marginRight']);
      var marginLeft = parseFloat(styles['marginLeft']);
      top = pos.top - marginTop;
      left = pos.left - marginLeft;
      height = pos.height + marginTop + marginBottom;
      width = pos.width + marginLeft + marginRight;
    } else {
      var o = this.offset(el);
      top = this.relative ? el.offsetTop : o.top - (this.wmargin ? -1 : 1) * this.elT;
      left = this.relative ? el.offsetLeft : o.left - (this.wmargin ? -1 : 1) * this.elL;
      height = el.offsetHeight;
      width = el.offsetWidth;
    }

    //console.log('get dim', top, left, this.canvasRelative);

    return [top, left, height, width];
  },

  /**
   * Get children dimensions  
   * 获取儿童维度
   * @param {HTMLELement} el Element root
   * @retun {Array}
   * */
  getChildrenDim(trg) {
    var dims = [];
    if(!trg)
      return dims;

    // Get children based on getChildrenContainer
    // 获取基于getChildrenContainer的孩子
    var trgModel = this.getTargetModel(trg);
    if (trgModel && trgModel.view && !this.ignoreViewChildren) {
      trg = trgModel.view.getChildrenContainer();
    }

    var ch = trg.children;

    for (var i = 0, len = ch.length; i < len; i++) {
      var el = ch[i];

      if (!el.matches(this.itemSel)) {
        continue;
      }

      var dim = this.getDim(el);
      var dir = this.direction;

      if(dir == 'v')
        dir = true;
      else if(dir == 'h')
        dir = false;
      else
        dir = this.isInFlow(el, trg);

      dim.push(dir);
      dim.push(el);
      dims.push(dim);
    }

    return dims;
  },

  /**
   * Check if the coordinates are near to the borders
   * 检查坐标是否接近边界
   * @param {Array<number>} dim
   * @param {number} rX Relative X position 相对X位
   * @param {number} rY Relative Y position 相对Y位置
   * @return {Boolean}
   * */
  nearBorders(dim, rX, rY) {
    var result = 0;
    var off = this.borderOffset;
    var x = rX || 0;
    var y = rY || 0;
    var t = dim[0];
    var l = dim[1];
    var h = dim[2];
    var w = dim[3];
    if( ((t + off) > y) || (y > (t + h - off)) ||
        ((l + off) > x) || (x > (l + w - off)) )
      result = 1;

    return !!result;
  },

  /**
   * Find the position based on passed dimensions and coordinates
   * 根据传递的尺寸和坐标找出位置
   * @param {Array<Array>} dims Dimensions of nodes to parse 要解析的节点尺寸
   * @param {number} posX X coordindate X坐标
   * @param {number} posY Y coordindate Y坐标
   * @retun {Object}
   * */
  findPosition(dims, posX, posY) {
    var result = {index: 0, method: 'before'};
    var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
    // Each dim is: Top, Left, Height, Width
    // 每个暗淡的是：上，左，高，宽
    for(var i = 0, len = dims.length; i < len; i++){
      dim = dims[i];
      // Right position of the element. Left + Width
      // 元素的正确位置 左+宽
      dimRight = dim[1] + dim[3];
      // Bottom position of the element. Top + Height
      // 元素的底部位置。 顶部+高度
      dimDown = dim[0] + dim[2];
      // X center position of the element. Left + (Width / 2)
      // X元素的中心位置。 左+（宽/ 2）
      xCenter = dim[1] + (dim[3] / 2);
      // Y center position of the element. Top + (Height / 2)
      // Y元素的中心位置。 顶部+（身高/ 2）
      yCenter = dim[0] + (dim[2] / 2);
      // Skip if over the limits
      // 跳过超过极限
      if( (xLimit && dim[1] > xLimit) ||
          (yLimit && yCenter >= yLimit) || // >= avoid issue with clearfixes 避免使用clearfix的问题
          (leftLimit && dimRight < leftLimit) )
          continue;
      result.index = i;
      // If it's not in flow (like 'float' element)
      // 如果它不是流（像'float'元素）
      if(!dim[4]){
        if(posY < dimDown)
          yLimit = dimDown;
        //If x lefter than center
        // 如果x比中心更轻
        if(posX < xCenter){
          xLimit = xCenter;
          result.method = "before";
        }else{
          leftLimit = xCenter;
          result.method = "after";
        }
      }else{
        // If y upper than center
        // 如果y高于中心
        if(posY < yCenter){
          result.method = "before";
          break;
        }else
          result.method = "after"; // After last element 最后一个元素
      }
    }
    return result;
  },


  /**
   * Updates the position of the placeholder
   * 更新占位符的位置
   * @param {HTMLElement} phl
   * @param {Array<Array>} dims
   * @param {Object} pos Position object 位置对象
   * @param {Array<number>} trgDim target dimensions 目标尺寸
   * */
  movePlaceholder(plh, dims, pos, trgDim) {
    var marg = 0, t = 0, l = 0, w = 0, h = 0,
    un = 'px', margI = 5, brdCol = '#62c462', brd = 3,
    method = pos.method;
    var elDim = dims[pos.index];
    plh.style.borderColor = 'transparent ' + brdCol;
    plh.style.borderWidth = brd + un + ' ' + (brd + 2) + un;
    plh.style.margin = '-' + brd + 'px 0 0';
    if(elDim){
      // If it's not in flow (like 'float' element)
      // 如果它不是流（像'float'元素）
      if(!elDim[4]){
        w = 'auto';
        h = elDim[2] - (marg * 2) + un;
        t = elDim[0] + marg;
        l = (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
        plh.style.borderColor = brdCol + ' transparent';
        plh.style.borderWidth = (brd + 2) + un + ' ' + brd + un;
        plh.style.margin = '0 0 0 -' + brd + 'px';
      }else{
        w = elDim[3] + un;
        h = 'auto';
        t = (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
        l = elDim[1];
      }
    }else{
      if(!this.nested){
        plh.style.display = 'none';
        return;
      }
      if(trgDim){
        t = trgDim[0] + margI;
        l = trgDim[1] + margI;
        w = (parseInt(trgDim[3]) - margI * 2) + un;
        h = 'auto';
      }
    }
    plh.style.top = t + un;
    plh.style.left = l + un;
    if(w)
      plh.style.width = w;
    if(h)
      plh.style.height = h;
  },

  /**
   * Leave item
   * @param event
   *
   * @return void
   * */
  endMove(e) {
    var created;
    this.$el.off('mousemove', this.onMove);
    this.$document.off('mouseup', this.endMove);
    this.$document.off('keydown', this.rollback);
    this.plh.style.display = 'none';
    var clsReg = new RegExp('(?:^|\\s)'+this.freezeClass+'(?!\\S)', 'gi');
    let src = this.eV;

    if (src) {
      var srcModel = this.getSourceModel();
      if (srcModel && srcModel.set) {
        srcModel.set('status', '');
        srcModel.set('status', 'selected');
        //this.selectOnEnd && srcModel.set('status', 'selected');
      }
    }

    if (this.moved) {
      created = this.move(this.target, src, this.lastPos);
    }

    if(this.plh)
      this.plh.style.display = 'none';

    if(typeof this.onEndMove === 'function')
      this.onEndMove(created);

    var dragHelper = this.dragHelper;

    if(dragHelper) {
      dragHelper.remove();
      this.dragHelper = null;
    }

    this.selectTargetModel();
    this.toggleSortCursor();
  },

  /**
   * Move component to new position
   * 将组件移动到新位置
   * @param {HTMLElement} dst Destination target 目标目标
   * @param {HTMLElement} src Element to move 元素移动
   * @param {Object} pos Object with position coordinates 具有位置坐标的对象
   * */
  move(dst, src, pos) {
    var em = this.em;
    em && em.trigger('component:dragEnd:before', dst, src, pos);
    var warns = [];
    var index = pos.index;
    var modelToDrop, modelTemp, created;
    var validResult = this.validTarget(dst);
    var targetCollection = $(dst).data('collection');
    var model = validResult.srcModel;
    var droppable = validResult.droppable;
    var draggable = validResult.draggable;
    var dropInfo = validResult.dropInfo;
    var dragInfo = validResult.dragInfo;
    var dropContent = this.dropContent;
    droppable = validResult.trgModel instanceof Backbone.Collection ? 1 : droppable;

    if (targetCollection && droppable && draggable) {
      index = pos.method === 'after' ? index + 1 : index;
      var opts = {at: index, noIncrement: 1};

      if (!dropContent) {
        modelTemp = targetCollection.add({}, opts);

        if (model) {
          modelToDrop = model.collection.remove(model);
        }
      } else {
        modelToDrop = dropContent;
        opts.silent = false;
        opts.avoidUpdateStyle = 1;
      }

      created = targetCollection.add(modelToDrop, opts);

      if (!dropContent) {
        targetCollection.remove(modelTemp);
      } else {
        this.dropContent = null;
      }

      // This will cause to recalculate children dimensions
      // 这将导致重新计算儿童维度
      this.prevTarget = null;
    } else {
      if (!targetCollection) {
        warns.push('Target collection not found');
      }

      if (!droppable) {
        warns.push(`Target is not droppable, accepts [${dropInfo}]`);
      }

      if (!draggable) {
        warns.push(`Component not draggable, acceptable by [${dragInfo}]`);
      }

      console.warn('Invalid target position: ' + warns.join(', '));
    }

    em && em.trigger('component:dragEnd', targetCollection, modelToDrop, warns);

    return created;
  },

  /**
   * Rollback to previous situation
  //  * 回滚到以前的情况
   * @param {Event}
   * @param {Bool} Indicates if rollback in anycase 如果在任何情况下回滚
   * */
  rollback(e) {
    $(document).off('keydown', this.rollback);
    this.$document.off('keydown', this.rollback);
    var key = e.which || e.keyCode;

    if (key == 27) {
      this.moved = false;
      this.endMove();
    }
    return;
  },

});
