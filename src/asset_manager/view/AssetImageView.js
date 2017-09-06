module.exports = require('./AssetView').extend({

  events: {
    click: 'handleClick',
    dblclick: 'handleDblClick',
    'click [data-toggle=asset-remove]': 'removeItem',
  },

  getPreview() {
    const pfx = this.pfx;
    const src = this.model.get('src');
    return `
      <div class="${pfx}preview" style="background-image: url(${src});"></div>
      <div class="${pfx}preview-bg ${this.ppfx}checker-bg"></div>
    `;
  },

  getInfo() {
    const pfx = this.pfx;
    const model = this.model;
    let name = model.get('name');
    let width = model.get('width');
    let height = model.get('height');
    let unit = model.get('unitDim');
    let dim = width && height ? `${width}x${height}${unit}` : '';
    name = name || model.getFilename();
    return `
      <div class="${pfx}name">${name}</div>
      <div class="${pfx}dimensions">${dim}</div>
    `;
  },

  init(o) {
    const pfx = this.pfx;
    this.className  += ` ${pfx}asset-image`;
  },

  /**
   * Trigger when the asset is clicked
   * 当资源被点击时触发
   * @private
   * */
  handleClick() {
    var onClick = this.config.onClick;
    var model = this.model;
    this.collection.trigger('deselectAll');
    this.$el.addClass(this.pfx + 'highlight');

    if (typeof onClick === 'function') {
      onClick(model);
    } else {
      this.updateTarget(model.get('src'));
    }
  },

  /**
   * Trigger when the asset is double clicked
   * 双击资产时触发
   * @private
   * */
  handleDblClick() {
    var onDblClick = this.config.onDblClick;
    var model = this.model;

    if (typeof onDblClick === 'function') {
      onDblClick(model);
    } else {
      this.updateTarget(model.get('src'));
    }

    var onSelect = this.collection.onSelect;
    if (typeof onSelect == 'function') {
      onSelect(this.model);
    }
  },

  /**
   * Update target if exists
   * 如果存在更新目标
   * @param  {String}  v   Value
   * @private
   * */
  updateTarget(v) {
    const target = this.collection.target;

    if (target && target.set) {
      var attr = _.clone(target.get('attributes'));
      target.set('attributes', attr );
      target.set('src', v );
    }
  },

  /**
   * Remove asset from collection
   * 从收集中移除资产
   * @private
   * */
  removeItem(e) {
    e.stopPropagation();
    this.model.collection.remove(this.model);
  }
});
