import Styleable from 'domain_abstract/model/Styleable';

var Backbone   = require('backbone');
var Components = require('./Components');
var Selectors  = require('selector_manager/model/Selectors');
var Traits     = require('trait_manager/model/Traits');

const escapeRegExp = (str) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

module.exports = Backbone.Model.extend(Styleable).extend({

  defaults: {
    // HTML tag of the component
    // 组件的HTML标记
    tagName: 'div',

    // Component type, eg. 'text', 'image', 'video', etc.
    type: '',

    // True if the component is removable from the canvas
    // 如果组件可以从画布上移除，则为true。
    removable: true,

    // Indicates if it's possible to drag the component inside other
    // Tip: Indicate an array of selectors where it could be dropped inside
    // 表示是否有可能将组件拖到其他组件中。
    // 提示：表示选择器的数组，可以放在其中。
    
    draggable: true,

    // Indicates if it's possible to drop other components inside
    // Tip: Indicate an array of selectors which could be dropped inside

    // 表示是否有可能将其他组件删除
    // 提示：指示一个选择器数组，它可以在内部被删除。
    droppable: true,

    // Set false if don't want to see the badge (with the name) over the component
    // 如果不想在组件上看到标记（名称），则设置false
    badgable: true,

    // True if it's possible to style it
    // Tip:  Indicate an array of CSS properties which is possible to style

    // 威胁如果它的风格，它的两个可能的
    // 提示：的阵列表示的CSS属性，这是可能的两种风格
    stylable: true,

    // Highlightable with 'dotted' style if true
    // “点缀”式的highlightable如果真
    highlightable: true,

    // True if it's possible to clone the component
    // 如果可以克隆组件，则为true。
    copyable: true,

    // Indicates if it's possible to resize the component (at the moment implemented only on Image Components)
    // It's also possible to pass an object as options for the Resizer
    // 表示是否可以调整组件的大小（目前仅在图像组件上实现）
    // 也可以传递一个对象作为缩放选项
    resizable: false,

    // Allow to edit the content of the component (used on Text components)
    // 允许编辑组件的内容（用于文本组件）
    editable: false,

    // Hide the component inside Layers
    // 将组件隐藏在图层中
    layerable: true,

    // This property is used by the HTML exporter as void elements do not
    // have closing tag, eg. <br/>, <hr/>, etc.
    void: false,

    // Indicates if the component is in some CSS state like ':hover', ':active', etc.
    //  指示组件是否处于某些CSS状态中。
    state: '',

    // State, eg. 'selected'
    status: '',

    // Content of the component (not escaped) which will be appended before children rendering
    // 在儿童渲染之前附加的组件的内容（未转义）
    content: '',

    // Component icon, this string will be inserted before the name, eg. '<i class="fa fa-square-o"></i>'
    // 组件图标，该字符串将插入名称之前，例如。
    icon: '',

    // Component related style
    // 组件相关的风格
    style: {},

    // Key-value object of the component's attributes
    // 组件属性的键值对象
    attributes: '',

    // Array of classes
    // 数组类
    classes: '',

    // Component's javascript
    // 组件的JavaScript
    script: '',

    // Traits
    traits: ['id', 'title'],

    /**
      * Set an array of items to show up inside the toolbar (eg. move, clone, delete)
      * 设置一个在工具栏中显示的项数组（例如移动、克隆、删除）
      * when the component is selected
      * 当组件被选中时
      * toolbar: [{
      *     attributes: {class: 'fa fa-arrows'},
      *     command: 'tlb-move',
      *   },{
      *     attributes: {class: 'fa fa-clone'},
      *     command: 'tlb-clone',
      * }]
    */
    toolbar: null,
  },

  initialize(props = {}, opt = {}) {
    const em = opt.sm || {};

    // Check void elements
    if(opt && opt.config &&
      opt.config.voidElements.indexOf(this.get('tagName')) >= 0) {
        this.set('void', true);
    }

    this.opt = opt;
    this.sm = em;
    this.config = props;
    this.set('attributes', this.get('attributes') || {});
    this.listenTo(this, 'change:script', this.scriptUpdated);
    this.listenTo(this, 'change:traits', this.traitsUpdated);
    this.loadTraits();
    this.initClasses();
    this.initComponents();
    this.initToolbar();

    // Normalize few properties from strings to arrays
    // 将字符串中的少数属性正常化为数组
    var toNormalize = ['stylable'];
    toNormalize.forEach(function(name) {
      var value = this.get(name);

      if (typeof value == 'string') {
        var newValue = value.split(',').map(prop => prop.trim());
        this.set(name, newValue);
      }
    }, this);

    this.set('status', '');
    this.init();
  },

  initClasses() {
    const classes = this.normalizeClasses(this.get('classes') || this.config.classes || []);
    this.set('classes', new Selectors(classes));
    return this;
  },

  initComponents() {
    let comps = new Components(this.get('components'), this.opt);
    comps.parent = this;
    this.set('components', comps);
    return this;
  },

  /**
   * Initialize callback
   */
  init() {},

  /**
   * Script updated
   * 脚本更新
   */
  scriptUpdated() {
    this.set('scriptUpdated', 1);
  },

  /**
   * Once traits are updated I have to populates model's attributes
   * 一旦更新，我必须填充特征模型的属性
   */
  traitsUpdated() {
    let found = 0;
    const attrs = Object.assign({}, this.get('attributes'));
    const traits = this.get('traits');

    if (!(traits instanceof Traits)) {
      this.loadTraits();
      return;
    }

    traits.each((trait) => {
      found = 1;
      if (!trait.get('changeProp')) {
        const value = trait.getInitValue();
        if (value) {
          attrs[trait.get('name')] = value;
        }
      }
    });

    found && this.set('attributes', attrs);
  },

  /**
   * Init toolbar
   * 初始化工具栏
   */
   initToolbar() {
    var model = this;
    if(!model.get('toolbar')) {
      var tb = [];
      if(model.get('draggable')) {
        tb.push({
          attributes: {class: 'fa fa-arrows'},
          command: 'tlb-move',
        });
      }
      if(model.get('copyable')) {
        tb.push({
          attributes: {class: 'fa fa-clone'},
          command: 'tlb-clone',
        });
      }
      if(model.get('removable')) {
        tb.push({
          attributes: {class: 'fa fa-trash-o'},
          command: 'tlb-delete',
        });
      }
      model.set('toolbar', tb);
    }
  },

  /**
   * Load traits
   * 负荷特性
   * @param  {Array} traits
   * @private
   */
  loadTraits(traits, opts = {}) {
    var trt = new Traits();
    trt.setTarget(this);
    traits = traits || this.get('traits');

    if (traits.length) {
      trt.add(traits);
    }

    this.set('traits', trt, opts);
    return this;
  },

  /**
   * Normalize input classes from array to array of objects
   * 从数组到对象数组正常化输入类
   * @param {Array} arr
   * @return {Array}
   * @private
   */
  normalizeClasses(arr) {
     var res = [];

     if(!this.sm.get)
      return;

    var clm = this.sm.get('SelectorManager');
    if(!clm)
      return;

    arr.forEach(val => {
      var name = '';

      if(typeof val === 'string')
        name = val;
      else
        name = val.name;

      var model = clm.add(name);
      res.push(model);
    });
    return res;
  },

  /**
   * Override original clone method
   * 重写原始克隆方法
   * @private
   */
  clone(reset) {
    var attr = _.clone(this.attributes),
    comp = this.get('components'),
    traits = this.get('traits'),
    cls = this.get('classes');
    attr.components = [];
    attr.classes = [];
    attr.traits = [];

    comp.each((md, i) => {
      attr.components[i]	= md.clone(1);
    });
    traits.each((md, i) => {
      attr.traits[i] = md.clone();
    });
    cls.each((md, i) => {
      attr.classes[i]	= md.get('name');
    });

    attr.status = '';
    attr.view = '';

    if(reset){
      this.opt.collection = null;
    }

    return new this.constructor(attr, this.opt);
  },

  /**
   * Get the name of the component
   * 获取组件的名称
   * @return {string}
   * */
  getName() {
    let customName = this.get('custom-name');
    let tag = this.get('tagName');
    tag = tag == 'div' ? 'box' : tag;
    let name = this.get('type') || tag;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return customName || name;
  },

  /**
   * Get the icon string
   * 获取图标字符串
   * @return {string}
   */
  getIcon() {
    let icon = this.get('icon');
    return icon ? icon + ' ' : '';
  },

  /**
   * Return HTML string of the component
   * 返回组件的HTML字符串
   * @param {Object} opts Options
   * @return {string} HTML string
   * @private
   */
  toHTML(opts) {
    var code = '';
    var m = this;
    var tag = m.get('tagName');
    var idFound = 0;
    var sTag = m.get('void');
    var attrId = '';
    var strAttr = '';
    var attr = this.getAttrToHTML();

    for (var prop in attr) {
      if (prop == 'id') {
        idFound = 1;
      }
      var val = attr[prop];
      strAttr += typeof val !== undefined && val !== '' ?
        ' ' + prop + '="' + val + '"' : '';
    }

    // Build the string of classes
    // of the string类的建立
    var strCls = '';
    m.get('classes').each(m => {
      strCls += ' ' + m.get('name');
    });
    strCls = strCls !== '' ? ' class="' + strCls.trim() + '"' : '';

    // If style is not empty I need an ID attached to the component
    // 如果样式不是空的，我需要一个附加到组件的ID。
    if(!_.isEmpty(m.get('style')) && !idFound)
      attrId = ' id="' + m.getId() + '" ';

    code += '<' + tag + strCls + attrId + strAttr + (sTag ? '/' : '') + '>' + m.get('content');

    m.get('components').each(m => {
      code += m.toHTML();
    });

    if(!sTag)
      code += '</'+tag+'>';

    return code;
  },

  /**
   * Returns object of attributes for HTML
   * 返回HTML属性的对象
   * @return {Object}
   * @private
   */
  getAttrToHTML() {
    var attr = this.get('attributes') || {};
    delete attr.style;
    return attr;
  },

  /**
   * Return a shallow copy of the model's attributes for JSON
   * 返回JSON的模型属性的浅拷贝
   * stringification.
   * @return {Object}
   * @private
   */
  toJSON(...args) {
    var obj = Backbone.Model.prototype.toJSON.apply(this, args);
    var scriptStr = this.getScriptString();
    delete obj.toolbar;

    if (scriptStr) {
      obj.script = scriptStr;
    }

    return obj;
  },

  /**
   * Return model id
   * 回归模型的ID
   * @return {string}
   */
  getId() {
    let attrs = this.get('attributes') || {};
    return attrs.id || this.cid;
  },

  /**
   * Return script in string format, cleans 'function() {..' from scripts
   * if it's a function
   * @param {string|Function} script
   * @return {string}
   * @private
   */
  getScriptString(script) {
    var scr = script || this.get('script');

    if (!scr) {
      return scr;
    }

    // Need to convert script functions to strings
    // 需要将脚本函数转换为字符串
    if (typeof scr == 'function') {
      var scrStr = scr.toString().trim();
      scrStr = scrStr.replace(/^function[\s\w]*\(\)\s?\{/, '').replace(/\}$/, '');
      scr = scrStr.trim();
    }

    var config = this.sm.config || {};
    var tagVarStart = escapeRegExp(config.tagVarStart || '{[ ');
    var tagVarEnd = escapeRegExp(config.tagVarEnd || ' ]}');
    var reg = new RegExp(`${tagVarStart}(\\w+)${tagVarEnd}`, 'g');
    scr = scr.replace(reg, (match, v) => {
      // If at least one match is found I have to track this change for a
      // better optimization inside JS generator

      // 如果发现至少有一个匹配，我必须跟踪这个更改
      // 更好的JS生成器内部优化
      this.scriptUpdated();
      return this.attributes[v];
    })

    return scr;
  }

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
    return {tagName: el.tagName ? el.tagName.toLowerCase() : ''};
  },

});
