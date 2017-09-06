var Component = require('./Component');

module.exports = Component.extend({

  defaults: _.extend({}, Component.prototype.defaults, {
    type: 'image',
    tagName: 'img',
    src: '',
    void: 1,
    droppable: false,
    resizable: true,
    traits: ['alt']
  }),

  initialize(o, opt) {
    Component.prototype.initialize.apply(this, arguments);
    var attr = this.get('attributes');
    if(attr.src)
      this.set('src', attr.src);
  },

  initToolbar(...args) {
    Component.prototype.initToolbar.apply(this, args);

    if (this.sm && this.sm.get) {
      var cmd = this.sm.get('Commands');
      var cmdName = 'image-editor';

      // Add Image Editor button only if the default command exists
      // 仅当默认命令存在时，添加“图像编辑器”按钮。
      if (cmd.has(cmdName)) {
        var tb = this.get('toolbar');
        tb.push({
          attributes: {class: 'fa fa-pencil'},
          command: cmdName,
        });
        this.set('toolbar', tb);
      }
    }
  },

  /**
   * Returns object of attributes for HTML
   * 返回HTML属性的对象
   * @return {Object}
   * @private
   */
  getAttrToHTML(...args) {
    var attr = Component.prototype.getAttrToHTML.apply(this, args);
    delete attr.onmousedown;
    var src = this.get('src');
    if(src)
      attr.src = src;
    return attr;
  },

  /**
   * Parse uri
   * 解析URI
   * @param  {string} uri
   * @return {object}
   * @private
   */
  parseUri(uri) {
    var el = document.createElement('a');
    el.href = uri;
    var query = {};
    var qrs = el.search.substring(1).split('&');
    for (var i = 0; i < qrs.length; i++) {
      var pair = qrs[i].split('=');
      var name = decodeURIComponent(pair[0]);
      if(name)
        query[name] = decodeURIComponent(pair[1]);
    }
    return {
      hostname: el.hostname,
      pathname: el.pathname,
      protocol: el.protocol,
      search: el.search,
      hash: el.hash,
      port: el.port,
      query,
    };
  },

},{

  /**
   * Detect if the passed element is a valid component.
   * In case the element is valid an object abstracted
   * from the element will be returned
   * 检测传入的元素是否是有效的组件。
   * 如果元素是有效的，对象将被抽象。
   * 将从元素返回
   * @param {HTMLElement}
   * @return {Object}
   * @private
   */
  isComponent(el) {
    var result = '';
    if(el.tagName == 'IMG'){
      result = {type: 'image'};
    }
    return result;
  },

});
