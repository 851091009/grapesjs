module.exports = {
  /**
   * Check if fullscreen mode is enabled
   * 检查是否启用全屏模式
   * @return {Boolean}
   */
  isEnabled() {
    var d = document;
    if(d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement)
      return 1;
    else
      return 0;
  },

  /**
   * Enable fullscreen mode and return browser prefix
   * 启用全屏模式返回浏览器前缀
   * @param  {HTMLElement} el
   * @return {string}
   */
  enable(el) {
    var pfx = '';
    if (el.requestFullscreen)
      el.requestFullscreen();
    else if (el.webkitRequestFullscreen) {
      pfx = 'webkit';
      el.webkitRequestFullscreen();
    }else if (el.mozRequestFullScreen) {
      pfx = 'moz';
      el.mozRequestFullScreen();
    }else if (el.msRequestFullscreen)
      el.msRequestFullscreen();
    else
      console.warn('Fullscreen not supported');
    return pfx;
  },

  /**
   * Disable fullscreen mode
   * 禁用全屏模式
   */
  disable() {
    var d = document;
    if (d.exitFullscreen)
      d.exitFullscreen();
    else if (d.webkitExitFullscreen)
      d.webkitExitFullscreen();
    else if (d.mozCancelFullScreen)
      d.mozCancelFullScreen();
    else if (d.msExitFullscreen)
      d.msExitFullscreen();
  },

  /**
   * Triggered when the state of the fullscreen is changed. Inside detects if
   * 触发时，全屏状态改变。如果在检测
   * it's enabled
   * 它的启用
   * @param  {strinf} pfx Browser prefix
   * @param  {Event} e
  */
  fsChanged(pfx, e) {
    var d = document;
    var ev = (pfx || '') + 'fullscreenchange';
    if(!this.isEnabled()){
      this.stop(null, this.sender);
      document.removeEventListener(ev, this.fsChanged);
    }
  },

  run(editor, sender) {
    this.sender = sender;
    var pfx = this.enable(editor.getContainer());
    this.fsChanged = this.fsChanged.bind(this, pfx);
    document.addEventListener(pfx + 'fullscreenchange', this.fsChanged);
    if(editor)
      editor.trigger('change:canvasOffset');
  },

  stop(editor, sender) {
    if(sender && sender.set)
      sender.set('active', false);
    this.disable();
    if(editor)
      editor.trigger('change:canvasOffset');
  }

};
