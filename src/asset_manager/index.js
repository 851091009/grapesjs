/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [store](#store)
 * * [load](#load)
 * * [getContainer](#getcontainer)
 * * [getAssetsEl](#getassetsel)
 * * [onClick](#onClick)
 * * [onDblClick](#onDblClick)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 *
 * Before using this methods you should get first the module from the editor instance, in this way:
 * 在使用此方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 * ```js
 * var assetManager = editor.AssetManager;
 * ```
 *
 * @module AssetManager 资产经理
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.assets=[]] Default assets
 * @param {String} [config.uploadText='Drop files here or click to upload'] Upload text
 * @param {String} [config.addBtnText='Add image'] Text for the add button
 * @param {String} [config.upload=''] Where to send upload data. Expects as return a JSON with asset/s object
 * as: {data: [{src:'...'}, {src:'...'}]}
 * @return {this}
 * @example
 * ...
 * {
 * 	assets: [
 *  	{src:'path/to/image.png'},
 *     ...
 *  ],
 *  upload: 'http://dropbox/path', // Set to false to disable it
 *  uploadText: 'Drop files here or click to upload',
 *  uploadtext：删除文件或单击“上传”，
 * }
 */

module.exports = () => {
  let c = {};
  const defaults   = require('./config/config');
  const Assets     = require('./model/Assets');
  const AssetsView = require('./view/AssetsView');
  const FileUpload = require('./view/FileUploader');
  let assets, am, fu;

  return {

    /**
     * Name of the module
     * 模块名称
     * @type {String}
     * @private
     */
    name: 'AssetManager',

    /**
     * Mandatory for the storage manager
     * 存储管理器的强制性
     * @type {String}
     * @private
     */
    storageKey: 'assets',

    /**
     * Initialize module
     * 初始化模块
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};

      for (let name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      const ppfx = c.pStylePrefix;
      const em = c.em;

      if (ppfx) {
        c.stylePrefix = ppfx + c.stylePrefix;
      }

      // Global assets collection
      // 全球资产配置
      assets = new Assets(c.assets);
      const obj = {
        // Collection visible in asset manager
        // 资产管理器中可见的集合
        collection: new Assets([]),
        globalCollection: assets,
        config: c,
      };
      fu = new FileUpload(obj);
      obj.fu = fu;
      am = new AssetsView(obj);

      // Setup the sync between the global and public collections
      // 设置全局和公共集合之间的同步
      assets.listenTo(assets, 'add', (model) => {
        this.getAllVisible().add(model);
        em && em.trigger('asset:add', model);
      });

      assets.listenTo(assets, 'remove', (model) => {
        this.getAllVisible().remove(model);
        em && em.trigger('asset:remove', model);
      });

      return this;
    },

    /**
     * Add new asset/s to the collection. URLs are supposed to be unique
     * 向集合中添加新的资产/ s。URL应该是唯一的。
     * @param {string|Object|Array<string>|Array<Object>} asset URL strings or an objects representing the resource.
     * @return {Model}
     * @example
     * // In case of strings, would be interpreted as images
     * assetManager.add('http://img.jpg');
     * assetManager.add(['http://img.jpg', './path/to/img.png']);
     *
     * // Using objects you could indicate the type and other meta informations
     * assetManager.add({
     * 	src: 'http://img.jpg',
     * 	//type: 'image',	//image is default
     * 	height: 300,
     *	width: 200,
     * });
     * assetManager.add([{
     * 	src: 'http://img.jpg',
     * },{
     * 	src: './path/to/img.png',
     * }]);
     */
    add(asset) {
      return assets.add(asset);
    },

    /**
     * Returns the asset by URL
     * 通过URL返回该资产
     * @param  {string} src URL of the asset
     * @return {Object} Object representing the asset
     * @example
     * var asset = assetManager.get('http://img.jpg');
     */
    get(src) {
      return assets.where({src})[0];
    },

    /**
     * Return global collection
     * 返回全局集合
     * @return {Collection}
     */
    getAll() {
      return assets;
    },

    /**
     * Return visible collection
     * 、Return可见集合
     * @return {Collection}
     */
    getAllVisible() {
      return am.collection;
    },

    /**
     * Remove the asset by its URL
     * 通过URL删除该资产
     * @param  {string} src URL of the asset
     * @return {this}
     * @example
     * assetManager.remove('http://img.jpg');
     */
    remove(src) {
      var asset = this.get(src);
      this.getAll().remove(asset);
      return this;
    },

    /**
     * Store assets data to the selected storage
     * 将资产数据存储到选定的存储区
     * @param {Boolean} noStore If true, won't store
     * @return {Object} Data to store
     * @example
     * var assets = assetManager.store();
     */
    store(noStore) {
      var obj = {};
      var assets = JSON.stringify(this.getAll().toJSON());
      obj[this.storageKey] = assets;
      if(!noStore && c.stm)
        c.stm.store(obj);
      return obj;
    },

    /**
     * Load data from the passed object, if the object is empty will try to fetch them
     * 从已传递对象加载数据，如果对象为空，将尝试获取它们。
     * autonomously from the storage manager.
     * 从存储管理器自主地。
     * The fetched data will be added to the collection
     * 获取的数据将被添加到集合中。
     * @param {Object} data Object of data to load
     * @return {Object} Loaded assets
     * @example
     * var assets = assetManager.load();
     * // The format below will be used by the editor model
     * // to load automatically all the stuff
     * var assets = assetManager.load({
     * 	assets: [...]
     * });
     *
     */
    load(data) {
      var d = data || '';
      var name = this.storageKey;
      if(!d && c.stm)
        d = c.stm.load(name);
      var assets = d[name] || [];

      if (typeof assets == 'string') {
        try {
          assets = JSON.parse(d[name]);
        } catch(err) {}
      }

      if (assets && assets.length) {
        this.getAll().reset(assets);
      }

      return assets;
    },

    /**
     * Return the Asset Manager Container
     * 返回资产管理器容器
     * @return {HTMLElement}
     */
    getContainer() {
      return am.el;
    },

    /**
     *  Get assets element container
     * @return {HTMLElement}
     */
    getAssetsEl() {
      return am.el.querySelector('[data-el=assets]');
    },

    /**
     * Render assets
     * 使资产
     * @param  {Boolean} f Force to render, otherwise cached version will be returned
     * @return {HTMLElement}
     * @private
     */
    render(assets = []) {
      const toRender = assets.length ? assets : this.getAll().models;
      am.collection.reset(toRender);
      return this.getContainer();
    },

    postRender(editorView) {
      c.dropzone && fu.initDropzone(editorView); // fu : 上传页面
    },

    /**
     * Add new type
     * 添加新的类型
     * @param {string} id Type ID
     * @param {Object} definition Definition of the type. Each definition contains
     *                            `model` (business logic), `view` (presentation logic)
     *                            and `isType` function which recognize the type of the
     *                            passed entity
     * 
     *                            类型的定义。 每个定义包含
     *                            `model`（业务逻辑），`view`（表示逻辑）
     *                            和`isType`函数识别的类型
     *                            通过实体               
     * 
     * 
     * addType('my-type', {
     *  model: {},
     *  view: {},
     *  isType: (value) => {},
     * })
     */
    addType(id, definition) {
      this.getAll().addType(id, definition);
    },

    /**
     * Get type
     * 获取类型
     * @param {string} id Type ID
     * @return {Object} Type definition 类型定义
     */
    getType(id) {
      return this.getAll().getType(id);
    },

    /**
     * Get types
     * 获取全部类型
     * @return {Array}
     */
    getTypes() {
      return this.getAll().getTypes();
    },

    //-------

    /**
     * Set new target
     * 设定新的目标
     * @param	{Object}	m Model
     * @private
     * */
    setTarget(m) {
      am.collection.target = m;
    },

    /**
     * Set callback after asset was selected
     * 选择资产后设置回调
     * @param	{Object}	f Callback function
     * @private
     * */
    onSelect(f) {
      am.collection.onSelect = f;
    },

    /**
     * Set callback to fire when the asset is clicked
     * 在单击资产时设置回调为火
     * @param {function} func
     */
    onClick(func) {
      c.onClick = func;
    },

    /**
     * Set callback to fire when the asset is double clicked
     * 当双击资产时设置回调为火
     * @param {function} func
     */
    onDblClick(func) {
      c.onDblClick = func;
    },

  };
};
