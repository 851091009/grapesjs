/**
 *
 * * [getWrapper](#getwrapper)
 * * [getComponents](#getcomponents)
 * * [addComponent](#addcomponent)
 * * [clear](#clear)
 * * [load](#load)
 * * [store](#store)
 * * [render](#render)
 *
 * With this module is possible to manage components inside the canvas.
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * 使用这个模块可以管理画布中的组件。
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 * ```js
 * var domComponents = editor.DomComponents;
 * ```
 *
 * @module DomComponents
 * @param {Object} config Configurations
 * @param {string|Array<Object>} [config.components=[]] HTML string or an array of possible components
 * @example
 * ...
 * domComponents: {
 *    components: '<div>Hello world!</div>',
 * }
 * // Or
 * domComponents: {
 *    components: [
 *      { tagName: 'span', style: {color: 'red'}, content: 'Hello'},
 *      { style: {width: '100px', content: 'world!'}}
 *    ],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults      = require('./config/config'),
  Component     = require('./model/Component'),
  ComponentView = require('./view/ComponentView');

  var component, componentView;
  var componentTypes = [
    {
      id: 'cell',
      model: require('./model/ComponentTableCell'),
      view: require('./view/ComponentTableCellView'),
    },
    {
      id: 'row',
      model: require('./model/ComponentTableRow'),
      view: require('./view/ComponentTableRowView'),
    },
    {
      id: 'table',
      model: require('./model/ComponentTable'),
      view: require('./view/ComponentTableView'),
    },
    {
      id: 'map',
      model: require('./model/ComponentMap'),
      view: require('./view/ComponentMapView'),
    },
    {
      id: 'link',
      model: require('./model/ComponentLink'),
      view: require('./view/ComponentLinkView'),
    },
    {
      id: 'video',
      model: require('./model/ComponentVideo'),
      view: require('./view/ComponentVideoView'),
    },
    {
      id: 'image',
      model: require('./model/ComponentImage'),
      view: require('./view/ComponentImageView'),
    },
    {
      id: 'script',
      model: require('./model/ComponentScript'),
      view: require('./view/ComponentScriptView'),
    },
    {
      id: 'svg',
      model: require('./model/ComponentSvg'),
      view: require('./view/ComponentSvgView'),
    },
    {
      id: 'textnode',
      model: require('./model/ComponentTextNode'),
      view: require('./view/ComponentTextNodeView'),
    },
    {
      id: 'text',
      model: require('./model/ComponentText'),
      view: require('./view/ComponentTextView'),
    },
    {
      id: 'default',
      model: Component,
      view: ComponentView,
    },
  ];

  return {

    componentTypes,

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'DomComponents',

    /**
     * Returns config
     * 返回配置
     * @return {Object} Config object
     * @private
     */
    getConfig() {
        return c;
    },

    /**
     * Mandatory for the storage manager
     * 存储管理器的强制性
     * @type {String}
     * @private
     */
    storageKey() {
      var keys = [];
      var smc = (c.stm && c.stm.getConfig()) || {};
      if(smc.storeHtml)
        keys.push('html');
      if(smc.storeComponents)
        keys.push('components');
      return keys;
    },

    /**
     * Initialize module. Called on a new instance of the editor with configurations passed
     * inside 'domComponents' field
     * 初始化模块。调用具有配置的编辑器的新实例
     * 在“domcomponents”字段
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      const em = c.em;

      if (em) {
        c.components = em.config.components || c.components;
      }

      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      // Load dependencies
      // 加载依赖项
      if (em) {
        c.rte = em.get('rte') || '';
        c.modal = em.get('Modal') || '';
        c.am = em.get('AssetManager') || '';
        em.get('Parser').compTypes = componentTypes;
        em.on('change:selectedComponent', this.componentChanged, this);
      }

      // Build wrapper
      // 建立包装
      let components = c.components;
      let wrapper = Object.assign({}, c.wrapper);
      wrapper['custom-name'] = c.wrapperName;
      wrapper.wrapper = 1;

      // Components might be a wrapper
      // 组件可能是包装器。
      if (components && components.constructor === Object && components.wrapper) {
        wrapper = Object.assign({}, components);
        components = components.components || [];
        wrapper.components = [];

        // Have to put back the real object of components
        // 必须把组件的实际对象放回原处
        if (em) {
          em.config.components = components;
        }
      }

      component = new Component(wrapper, {
        sm: em,
        config: c,
        componentTypes,
      });
      component.set({ attributes: {id: 'wrapper'}});

      if(em && !em.config.loadCompsOnRender) {
        component.get('components').add(components);
      }

      componentView = new ComponentView({
        model: component,
        config: c,
        componentTypes,
      });
      return this;
    },

    /**
     * On load callback
     * 在负荷回调
     * @private
     */
    onLoad() {
      if(c.stm && c.stm.isAutosave()){
        c.em.initUndoManager();
        c.em.initChildrenComp(this.getWrapper());
      }
    },

    /**
     * Load components from the passed object, if the object is empty will try to fetch them
     * autonomously from the selected storage
     * The fetched data will be added to the collection
     * 
     * 从已传递对象中加载组件，如果对象为空，将尝试获取它们。
     * 自主选择存储
     * 获取的数据将被添加到集合中。
     * @param {Object} data Object of data to load
     * @return {Object} Loaded data
     */
    load(data = '') {
      let result = '';

      if (!data && c.stm) {
        data = c.em.getCacheLoad();
      }

      if (data.components) {
        try {
          result = JSON.parse(data.components);
        } catch (err) {}
      } else if (data.html) {
        result = data.html;
      }

      const isObj = result && result.constructor === Object;

      if ((result && result.length) || isObj) {
        this.clear();
        this.getComponents().reset();

        // If the result is an object I consider it the wrapper
        // 如果结果是一个对象，我认为它是包装器
        if (isObj) {
          this.getWrapper().set(result)
          .initComponents().initClasses().loadTraits();
        } else {
          this.getComponents().add(result);
        }
      }

      return result;
    },

    /**
     * Store components on the selected storage
     * 将组件存储在选定的存储中
     * @param {Boolean} noStore If true, won't store
     * @return {Object} Data to store
     */
    store(noStore) {
      if(!c.stm) {
        return;
      }

      var obj = {};
      var keys = this.storageKey();

      if (keys.indexOf('html') >= 0) {
        obj.html = c.em.getHtml();
      }

      if (keys.indexOf('components') >= 0) {
        const toStore = c.storeWrapper ?
          this.getWrapper() : this.getComponents();
        obj.components = JSON.stringify(toStore);
      }

      if (!noStore) {
        c.stm.store(obj);
      }

      return obj;
    },

    /**
     * Returns privately the main wrapper
     * 返回主包装器
     * @return {Object}
     * @private
     */
    getComponent() {
      return component;
    },

    /**
     * Returns root component inside the canvas. Something like <body> inside HTML page
     * The wrapper doesn't differ from the original Component Model
     * 
     * 返回画布中的根组件。类似<正文> html页面
     * 包装器与原始组件模型没有差别。
     * @return {Component} Root Component
     * @example
     * // Change background of the wrapper and set some attribute
     * // 更改包装器的背景并设置一些属性
     * var wrapper = domComponents.getWrapper();
     * wrapper.set('style', {'background-color': 'red'});
     * wrapper.set('attributes', {'title': 'Hello!'});
     */
    getWrapper() {
      return this.getComponent();
    },

    /**
     * Returns wrapper's children collection. Once you have the collection you can
     * add other Components(Models) inside. Each component can have several nested
     * components inside and you can nest them as more as you wish.
     * 
     * 返回包装器的子集合。一旦你有了收藏，你就可以
     * 在内部添加其他组件（模型）。每个组件可以有几个嵌套
     * 组件内，你可以嵌套他们更多的，因为你的愿望。
     * @return {Components} Collection of components
     * @example
     * // Let's add some component
     * var wrapperChildren = domComponents.getComponents();
     * var comp1 = wrapperChildren.add({
     *   style: { 'background-color': 'red'}
     * });
     * var comp2 = wrapperChildren.add({
     *   tagName: 'span',
     *   attributes: { title: 'Hello!'}
     * });
     * // Now let's add an other one inside first component
     * // First we have to get the collection inside. Each
     * // component has 'components' property
     * var comp1Children = comp1.get('components');
     * // Procede as before. You could also add multiple objects
     * comp1Children.add([
     *   { style: { 'background-color': 'blue'}},
     *   { style: { height: '100px', width: '100px'}}
     * ]);
     * // Remove comp2
     * wrapperChildren.remove(comp2);
     */
    getComponents() {
      return this.getWrapper().get('components');
    },

    /**
     * Add new components to the wrapper's children. It's the same
     * 向包装器的子组件添加新组件。是一样的
     * as 'domComponents.getComponents().add(...)'
     * @param {Object|Component|Array<Object>} component Component/s to add
     * @param {string} [component.tagName='div'] Tag name
     * @param {string} [component.type=''] Type of the component. Available: ''(default), 'text', 'image'
     * @param {boolean} [component.removable=true] If component is removable
     * @param {boolean} [component.draggable=true] If is possible to move the component around the structure
     * @param {boolean} [component.droppable=true] If is possible to drop inside other components
     * @param {boolean} [component.badgable=true] If the badge is visible when the component is selected
     * @param {boolean} [component.stylable=true] If is possible to style component
     * @param {boolean} [component.copyable=true] If is possible to copy&paste the component
     * @param {string} [component.content=''] String inside component
     * @param {Object} [component.style={}] Style object
     * @param {Object} [component.attributes={}] Attribute object
     * @return {Component|Array<Component>} Component/s added
     * @example
     * // Example of a new component with some extra property
     * var comp1 = domComponents.addComponent({
     *   tagName: 'div',
     *   removable: true, // Can't remove it
     *   draggable: true, // Can't move it
     *   copyable: true, // Disable copy/past
     *   content: 'Content text', // Text inside component
     *   style: { color: 'red'},
     *   attributes: { title: 'here' }
     * });
     */
    addComponent(component) {
      return this.getComponents().add(component);
    },

    /**
     * Render and returns wrapper element with all components inside.
     * Once the wrapper is rendered, and it's what happens when you init the editor,
     * the all new components will be added automatically and property changes are all
     * updated immediately
     * 
     * 呈现和返回包装器元素，其中包含所有组件。
     * 包装器被呈现后，它就是在初始化编辑器时发生的事情，
     * 所有新组件将自动添加，属性更改全部完成。
     * 立即更新
     * @return {HTMLElement}
     */
    render() {
      return componentView.render().el;
    },

    /**
     * Remove all components
     * 删除所有组件
     * @return {this}
     */
    clear() {
      var c = this.getComponents();
      for(var i = 0, len = c.length; i < len; i++)
        c.pop();
      return this;
    },

    /**
     * Set components
     * 设置组件
     * @param {Object|string} components HTML string or components model
     * @return {this}
     * @private
     */
    setComponents(components) {
      this.clear().addComponent(components);
    },

    /**
     * Add new component type
     * 添加新组件类型
     * @param {string} type
     * @param {Object} methods
     * @private
     */
    addType(type, methods) {
      var compType = this.getType(type);
      if(compType) {
        compType.model = methods.model;
        compType.view = methods.view;
      } else {
        methods.id = type;
        componentTypes.unshift(methods);
      }
    },

    /**
     * Get component type
     * 得到的组件类型
     * @param {string} type
     * @private
     */
    getType(type) {
      var df = componentTypes;

      for (var it = 0; it < df.length; it++) {
        var dfId = df[it].id;
        if(dfId == type) {
          return df[it];
        }
      }
      return;
    },

    /**
     * Triggered when the selected component is changed
     * 当所选组件被更改时触发。
     * @private
     */
    componentChanged() {
      const em = c.em;
      const model = em.get('selectedComponent');
      const previousModel = em.previous('selectedComponent');

      // Deselect the previous component
      // 取消以前的成分
      if (previousModel) {
        previousModel.set({
          status: '',
          state: '',
        });
      }

      model && model.set('status','selected');
    }

  };
};
