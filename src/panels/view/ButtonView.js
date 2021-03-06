var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  tagName: 'span',
  /**
    * _.bindAll(object, *methodNames) 
    * 把methodNames参数指定的一些方法绑定到object上，这些方法就会在对象的上下文环境中执行。
    listenTo: http://www.cnblogs.com/fengyuqing/p/backbone_events_api_usage.html?utm_source=tuicool&utm_medium=referral
  */
  initialize(o) {
   
    _.bindAll(this, 'startTimer', 'stopTimer', 'showButtons', 'hideButtons','closeOnKeyPress','onDrop', 'initSorter', 'stopDrag');
    var cls = this.model.get('className');
    this.config = o.config || {};
    this.em = this.config.em || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.id = this.pfx + this.model.get('id');
    this.activeCls = this.pfx + 'active';
    this.btnsVisCls = this.pfx + 'visible';
    this.parentM = o.parentM || null;
    this.className = this.pfx + 'btn' + (cls ? ' ' + cls : '');
    this.listenTo(this.model, 'change:active updateActive', this.updateActive); // 工具栏切换函数
    this.listenTo(this.model, 'checkActive', this.checkActive);
    this.listenTo(this.model, 'change:bntsVis', this.updateBtnsVis);
    this.listenTo(this.model, 'change:attributes', this.updateAttributes);
    this.listenTo(this.model, 'change:className', this.updateClassName);

    if(this.model.get('buttons').length){
      this.$el.on('mousedown', this.startTimer);
      this.$el.append($('<div>',{class: this.pfx + 'arrow-rd'}));
    }

    if(this.em && this.em.get)
      this.commands  = this.em.get('Commands');

    this.events = {};

    if(this.model.get('dragDrop')){
      this.events.mousedown = 'initDrag';//mousedown: 当按下鼠标按钮时, 触发事件
      this.em.on('loaded', this.initSorter);
    }else
      this.events.click = 'clicked'; // 工具栏点击切换
    this.delegateEvents();// http://www.css88.com/doc/backbone/#View-delegateEvents
  },

  initSorter() {
    if(this.em.Canvas){
      var canvas = this.em.Canvas;
      this.canvasEl = canvas.getBody();
      this.sorter = new this.em.Utils.Sorter({ // 开始拖拽
        container: this.canvasEl,
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        onMove: this.onDrag,
        onEndMove: this.onDrop,
        document: canvas.getFrameEl().contentDocument,
        direction: 'a',
        wmargin: 1,
        nested: 1,
      });
      var offDim = canvas.getOffset();
      this.sorter.offTop  = offDim.top;
      this.sorter.offLeft = offDim.left;
    }
  },

  /**
   * Init dragging element
   * 初始化拖动元素
   * @private
   */
  initDrag() {
    this.model.collection.deactivateAll(this.model.get('context'));
    this.sorter.startSort(this.el);
    this.sorter.setDropContent(this.model.get('options').content);
    this.canvasEl.style.cursor = 'grabbing';
    $(document).on('mouseup', this.stopDrag);// mouseup: 当松开鼠标按钮触发的事件
  },

  /**
   * Stop dragging
   * 停止拖动
   * @private
   */
  stopDrag() {
    // off() 方法通常用于移除通过 on() 方法添加的事件处理程序。
    $(document).off('mouseup', this.stopDrag);
    this.sorter.endMove();
  },

  /**
   * During drag method
   * 拖曳方式
   * @private
   */
  onDrag(e) {},

  /**
   * During drag method
   * 拖曳方式
   * @private
   */
  onDrop(e) {
    this.canvasEl.style.cursor = 'default';
  },

  /**
   * Updates class name of the button
   * 更新按钮的类名
   * @return   void
   * */
  updateClassName() {
    var cls = this.model.get('className');
    this.$el.attr('class', this.pfx + 'btn' + (cls ? ' ' + cls : ''));
  },

  /**
   * Updates attributes of the button
   * 更新按钮的属性
   * @return   void
   * */
  updateAttributes() {
    this.$el.attr(this.model.get("attributes"));
  },

  /**
   * Updates visibility of children buttons
   * 更新儿童按钮的可见性
   * @return  void
   * */
  updateBtnsVis() {
    if(!this.$buttons)
      return;

    if(this.model.get('bntsVis'))
      this.$buttons.addClass(this.btnsVisCls);
    else
      this.$buttons.removeClass(this.btnsVisCls);
  },

  /**
   * Start timer for showing children buttons
   * 启动计时器显示儿童按钮
   * @return  void
   * */
  startTimer() {
    this.timeout = setTimeout(this.showButtons, this.config.delayBtnsShow);
    $(document).on('mouseup', this.stopTimer);
  },

  /**
   * Stop timer for showing children buttons
   * 停止计时器显示儿童按钮
   * @return  void
   * */
  stopTimer() {
    $(document).off('mouseup',   this.stopTimer);
    if(this.timeout)
      clearTimeout(this.timeout);
  },

  /**
   * Show children buttons
   * 显示儿童按钮
   * @return   void
   * */
  showButtons() {
    clearTimeout(this.timeout);
    this.model.set('bntsVis', true);
    $(document).on('mousedown',  this.hideButtons);
    $(document).on('keypress',  this.closeOnKeyPress);// 按ESC键关闭按钮
  },

  /**
   * Hide children buttons
   * 隐藏儿童按钮
   * @return   void
   * */
  hideButtons(e) {
    if(e){ $(e.target).trigger('click'); }
    this.model.set('bntsVis', false);
    $(document).off('mousedown',  this.hideButtons);
    $(document).off('keypress',   this.closeOnKeyPress);
  },

  /**
   * Close buttons on ESC key press
   * 按ESC键关闭按钮
   * @param   {Object}  e  Event
   *
   * @return   void
   * */
  closeOnKeyPress(e) {
    var key = e.which || e.keyCode;
    if(key == 27)
      this.hideButtons();
  },

  /**
   * Update active status of the button
   * 更新按钮的活动状态，工具栏切换
   * @return   void
   * */
  updateActive() {
    var command  = null;
    var editor = this.em && this.em.get ? this.em.get('Editor') : null;
    var commandName = this.model.get('command');

    if (this.commands && typeof commandName === 'string') {
      command  = this.commands.get(commandName);
    } else if (commandName !== null && typeof commandName === 'object') {
      command = commandName;
    } else if (typeof commandName === 'function') {
      command = {run: commandName};
    }
   
    if(this.model.get('active')){

      this.model.collection.deactivateAll(this.model.get('context')); // 这个是控制 隐藏其他栏目
      this.model.set('active', true, { silent: true }).trigger('checkActive');
      
      if(this.parentM)
         this.parentM.set('active', true, { silent: true }).trigger('checkActive'); // 这个是控制显示对应的栏目

      if(command && command.run){
        command.run(editor, this.model, this.model.get('options'));
        editor.trigger('run:' + commandName);
      }
    }else{
      this.$el.removeClass(this.activeCls);

      this.model.collection.deactivateAll(this.model.get('context'));// 这个是控制 隐藏其他栏目
      
      if(this.parentM)
        this.parentM.set('active', false, { silent: true }).trigger('checkActive'); // 这个是控制显示对应的栏目

      if(command && command.stop){
        command.stop(editor, this.model, this.model.get('options'));
        editor.trigger('stop:' + commandName);
      }
    }
  },

  /**
   * Update active style status
   * 更新活动样式状态
   * @return   void
   * */
  checkActive() {
    if(this.model.get('active'))
      this.$el.addClass(this.activeCls);
    else
      this.$el.removeClass(this.activeCls);
  },

  /**
   * Triggered when button is clicked
   * 单击按钮时触发
   * @param  {Object}  e  Event
   *
   * @return   void
   * */
  clicked(e) {
    if(this.model.get('bntsVis') )
      return;
    
    if(this.parentM)
      this.swapParent();
    var active = this.model.get('active');
    this.model.set('active', !active); // 这一句控制着切换 ^_^

    // If the stop is requested
     var command = this.em.get('Commands').get('select-comp');
    // console.log(active);
    
    if(active){
      if(this.model.get('runDefaultCommand'))
        this.em.runDefault();
    }else{
      
      if(this.model.get('stopDefaultCommand'))
        this.em.stopDefault();
    }
    
  },

  /**
   * Updates parent model swapping properties
   * 更新父模型交换属性
   * @return  void
   * */
  swapParent() {
    this.parentM.collection.deactivateAll(this.model.get('context'));
    this.parentM.set('attributes',   this.model.get('attributes'));
    this.parentM.set('options',      this.model.get('options'));
    this.parentM.set('command',      this.model.get('command'));
    this.parentM.set('className',    this.model.get('className'));
    this.parentM.set('active', true, { silent: true }).trigger('checkActive');
  },

  render() {
    this.updateAttributes();
    this.$el.attr('class', this.className);

    if(this.model.get('buttons').length){
      var btnsView = require('./ButtonsView');                // Avoid Circular  Dependencies 避免循环依赖
      var view = new btnsView({
          collection   : this.model.get('buttons'),
          config    : this.config,
          parentM    : this.model
      });
      this.$buttons  = view.render().$el;
      this.$buttons.append($('<div>',{class: this.pfx + 'arrow-l'}));
      this.$el.append(this.$buttons);                      //childNodes avoids wrapping 'div'
    }

    return this;
  },

});
