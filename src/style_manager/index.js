/**
 *
 * * [addSector](#addsector)
 * * [getSector](#getsector)
 * * [getSectors](#getsectors)
 * * [addProperty](#addproperty)
 * * [getProperty](#getproperty)
 * * [getProperties](#getproperties)
 * * [getModelToStyle](#getmodeltostyle)
 * * [render](#render)
 *
 * With Style Manager you basically build categories (called sectors) of CSS properties which could
 * 使用样式管理器，基本上可以构建CSS属性的类（称为扇区）
 * be used to custom components and classes.
 * 用于自定义组件和类。
 * You can init the editor with all sectors and properties via configuration
 * 可以通过配置初始化所有扇区和属性的编辑器。
 *
 * ```js
 * var editor = grapesjs.init({
 *   ...
 *  styleManager: {...} // Check below for the possible properties
 *   ...
 * });
 * ```
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 *
 * ```js
 * var styleManager = editor.StyleManager;
 * ```
 *
 * @module StyleManager
 * @param {Object} config Configurations 配置文件
 * @param {Array<Object>} [config.sectors=[]] Array of possible sectors 可能部门阵列
 * @example
 * ...
 * styleManager: {
 *    sectors: [{
 *      id: 'dim',
 *      name: 'Dimension',
 *      properties: [{
 *        name: 'Width',
 *        property: 'width',
 *        type: 'integer',
 *        units: ['px', '%'],
 *        defaults: 'auto',
 *        min: 0,
          }],
 *     }],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults    = require('./config/config'),
  Sectors     = require('./model/Sectors'),
  SectorsView = require('./view/SectorsView');
  var sectors, SectView;

  return {

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'StyleManager',

    /**
     * Get configuration object
     * 获取配置对象
     * @return {Object}
     * @private
     */
    getConfig() {
      return c;
    },

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

      sectors    = new Sectors(c.sectors); // 行业
      SectView   = new SectorsView({
        collection: sectors,
        target: c.em,
        config: c,
      });
      return this;
    },

    /**
     * Add new sector to the collection. If the sector with the same id already exists,
     * add to the New部门收藏。如果已经存在的部门ID with the same，
     * that one will be returned
     * 那个会被退回
     * @param {string} id Sector id
     * @param  {Object} sector  Object representing sector 对象代表部门
     * @param  {string} [sector.name='']  Sector's label 行业标签
     * @param  {Boolean} [sector.open=true] Indicates if the sector should be opened 指示是否应打开扇区
     * @param  {Array<Object>} [sector.properties=[]] Array of properties 属性数组
     * @return {Sector} Added Sector
     * @example
     * var sector = styleManager.addSector('mySector',{
     *   name: 'My sector',
     *   open: true,
     *   properties: [{ name: 'My property'}]
     * });
     * */
    addSector(id, sector) {
      var result = this.getSector(id);
      if(!result){
        sector.id = id;
        result = sectors.add(sector);
      }
      return result;
    },

    /**
     * Get sector by id
     * 按id获取扇区
     * @param {string} id  Sector id
     * @return {Sector|null}
     * @example
     * var sector = styleManager.getSector('mySector');
     * */
    getSector(id) {
      var res  = sectors.where({id});
      return res.length ? res[0] : null;
    },

    /**
     * Get all sectors
     * 让所有的部门
     * @return {Sectors} Collection of sectors
     * */
    getSectors() {
      return sectors;
    },

    /**
     * Add property to the sector identified by id
     * 将属性添加到由id标识的扇区中
     * @param {string} sectorId Sector id 行业ID
     * @param {Object} property Property object 属性对象
     * @param {string} [property.name=''] Name of the property 物业名称
     * @param {string} [property.property=''] CSS property, eg. `min-height` CSS属性，例如`min-height`
     * @param {string} [property.type=''] Type of the property: integer | radio | select | color | file | composite | stack 属性的类型：integer | 收音机| 选择| 颜色| 文件| 复合|堆
     * @param {Array<string>} [property.units=[]] Unit of measure available, eg. ['px','%','em']. Only for integer type 可用单位，例如[ '像素'， '％'，'时间']。 仅适用于整数类型
     * @param {string} [property.unit=''] Default selected unit from `units`. Only for integer type
     * @param {number} [property.min=null] Min possible value. Only for integer type 来自`units`的默认选择单位。 仅适用于整数类型
     * @param {number} [property.max=null] Max possible value. Only for integer type 最大可能值。 仅适用于整数类型
     * @param {string} [property.defaults=''] Default value 默认值
     * @param {string} [property.info=''] Some description  一些描述
     * @param {string} [property.icon=''] Class name. If exists no text will be displayed 班级名称。 如果没有显示文本
     * @param {Boolean} [property.preview=false] Show layers preview. Only for stack type 显示图层预览。 仅适用于堆栈类型 
     * @param {string} [property.functionName=''] Indicates if value need to be wrapped in some function, for istance `transform: rotate(90deg)` 指示值是否需要包装在某些函数中，对于距离`transform：rotate（90deg）`
     * @param {Array<Object>} [property.properties=[]] Nested properties for composite and stack type 复合和堆栈类型的嵌套属性
     * @param {Array<Object>} [property.layers=[]] Layers for stack properties 堆栈属性层
     * @param {Array<Object>} [property.list=[]] List of possible options for radio and select types 无线电和选择类型的可能选项列表
     * @return {Property|null} Added Property or `null` in case sector doesn't exist 添加属性或“null”，如果扇区不存在
     * @example
     * var property = styleManager.addProperty('mySector',{
     *   name: 'Minimum height',
     *   property: 'min-height',
     *   type: 'select',
     *   defaults: '100px',
     *   list: [{
     *     value: '100px',
     *     name: '100',
     *    },{
     *      value: '200px',
     *      name: '200',
     *    }],
     * });
     * property: 属性
     */
    addProperty(sectorId, property) {
      var prop = null;
      var sector = this.getSector(sectorId);

      if(sector)
        prop = sector.get('properties').add(property);

      return prop;
    },

    /**
     * Get property by its CSS name and sector id
     * 通过CSS名称和扇区id获取属性
     * @param  {string} sectorId Sector id
     * @param  {string} name CSS property name, eg. 'min-height' CSS属性名称，例如“最小高度”
     * @return {Property|null}
     * @example
     * var property = styleManager.getProperty('mySector','min-height');
     */
    getProperty(sectorId, name) {
      var prop = null;
      var sector = this.getSector(sectorId);

      if(sector){
        prop = sector.get('properties').where({property: name});
        prop = prop.length == 1 ? prop[0] : prop;
      }

      return prop;
    },

    /**
     * Get properties of the sector
     * 获取扇区的属性
     * @param  {string} sectorId Sector id
     * @return {Properties} Collection of properties
     * @example
     * var properties = styleManager.getProperties('mySector');
     */
    getProperties(sectorId) {
      var props = null;
      var sector = this.getSector(sectorId);

      if(sector)
        props = sector.get('properties');

      return props;
    },

    /**
     * Get what to style inside Style Manager. If you select the component      在风格管理器中获得什么风格。如果您选择组件
     * without classes the entity is the Component itself and all changes will  如果没有类，实体就是组件本身，所有的变化都将是
     * go inside its 'style' property. Otherwise, if the selected component has 走在它的风格”的性质。否则，如果已经选定的组件
     * one or more classes, the function will return the corresponding CSS Rule 一个或多个类，函数将返回相应的CSS规则。
     * @param  {Model} model
     * @return {Model}
     */
    getModelToStyle(model) {
      var classes = model.get('classes');

      if(c.em && classes && classes.length) {
        var previewMode = c.em.get('Config').devicePreviewMode;
        var device = c.em.getDeviceModel();
        var state = !previewMode ? model.get('state') : '';
        var deviceW = device && !previewMode ? device.get('width') : '';
        var cssC = c.em.get('CssComposer');
        var valid = classes.getStyleable();
        var CssRule = cssC.get(valid, state, deviceW);

        if(CssRule && valid.length) {
          return CssRule;
        }
      }

      return model;
    },

    /**
     * Render sectors and properties
     * 渲染扇区和属性
     * @return  {HTMLElement}
     * */
    render() {
      return SectView.render().el;
    },

  };
};
