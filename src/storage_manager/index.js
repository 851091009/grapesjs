/**
 * - [isAutosave](#isautosave)
 * - [setAutosave](#setautosave)
 * - [getStepsBeforeSave](#getstepsbeforesave)
 * - [setStepsBeforeSave](#setstepsbeforesave)
 * - [getStorages](#getstorages)
 * - [getCurrent](#getcurrent)
 * - [setCurrent](#setcurrent)
 * - [add](#add)
 * - [get](#get)
 * - [store](#store)
 * - [load](#load)
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，方法如下：
 * ```js
 * var storageManager = editor.StorageManager;
 * ```
 *
 * @module StorageManager
 * 本地存储模块
 */
module.exports = () => {
  var c = {},
  defaults      = require('./config/config'),
  LocalStorage  = require('./model/LocalStorage'),  // 本地存储
  RemoteStorage = require('./model/RemoteStorage'); // 远程存储

  var storages = {};
  var defaultStorages = {};

  return {

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'StorageManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * 初始化模块 使用编辑器的新实例自动调用
     * @param {Object} config Configurations 配置
     * @param {string} [config.id='gjs-'] The prefix for the fields, useful to differentiate storing/loading 字段的前缀，用于区分存储/加载
     * with multiple editors on the same page. For example, in local storage, the item of HTML will be saved like 'gjs-html'
     * 在同一页上有多个编辑器。 例如，在本地存储中，HTML的项目将被保存为“gjs-html”
     * @param {Boolean} [config.autosave=true] Indicates if autosave mode is enabled, works in conjunction with stepsBeforeSave 指示是否启用自动保存模式，与stepsBeforeSave一起使用
     * @param {number} [config.stepsBeforeSave=1] If autosave enabled, indicates how many steps/changes are necessary 如果启用自动保护，则表示需要执行多少步骤/更改
     * before autosave is triggered
     * @param {string} [config.type='local'] Default storage type. Available: 'local' | 'remote' | ''(do not store)
     *                                       默认存储类型。可用：
     * @example
     * ...
     * {
     *    autosave: false,
     *    type: 'remote',
     * }
     * ...
     */
    init(config) {
      c = config || {};
      for (var name in defaults){
        if (!(name in c))
          c[name] = defaults[name];
      }

      defaultStorages.remote  = new RemoteStorage(c); // 远程存储
      defaultStorages.local   = new LocalStorage(c);   // 本地存储
      c.currentStorage = c.type; // type是存储的方式，本地还是远程
      return this;
    },

    /**
     * Callback executed after the module is loaded
     * 加载模块后执行回调
     * @private
     */
    onLoad() {
      this.loadDefaultProviders().setCurrent(c.type);
    },

    /**
     * Checks if autosave is enabled
     * 检查是否启用自动保存
     * @return {Boolean}
     * */
    isAutosave() {
      return !!c.autosave;
    },

    /**
     * Set autosave value
     * 设置自动保存值
     * @param  {Boolean}  v
     * @return {this}
     * */
    setAutosave(v) {
      c.autosave = !!v;
      return this;
    },

    /**
     * Returns number of steps required before trigger autosave
     * 触发自动保存前返回步骤数
     * @return {number}
     * */
    getStepsBeforeSave() {
      return c.stepsBeforeSave;
    },

    /**
     * Set steps required before trigger autosave
     * 触发自动保存之前设置步骤
     * @param  {number} v
     * @return {this}
     * */
    setStepsBeforeSave(v) {
      c.stepsBeforeSave  = v;
      return this;
    },

    /**
     * Add new storage
     * 添加新的存储
     * @param {string} id Storage ID
     * @param  {Object} storage Storage wrapper
     * @param  {Function} storage.load Load method
     * @param  {Function} storage.store Store method
     * @return {this}
     * @example
     * storageManager.add('local2', {
     *   load: function(keys){
     *     var res = {};
     *     for (var i = 0, len = keys.length; i < len; i++){
     *       var v = localStorage.getItem(keys[i]);
     *       if(v) res[keys[i]] = v;
     *     }
     *     return res;
     *   },
     *   store: function(data){
     *     for(var key in data)
     *       localStorage.setItem(key, data[key]);
     *   }
     * });
     * */
    add(id, storage) {
      storages[id] = storage;
      return this;
    },

    /**
     * Returns storage by id
     * 按ID返回存储
     * @param {string} id Storage ID
     * @return {Object|null}
     * */
    get(id) {
      return storages[id] || null;
    },

    /**
     * Returns all storages
     * 返回所有存储
     * @return   {Array}
     * */
    getStorages() {
      return storages;
    },

    /**
     * Returns current storage type
     * 返回当前存储类型
     * @return {string}
     * */
    getCurrent() {
      return c.currentStorage;
    },

    /**
     * Set current storage type
     * 设置当前存储类型
     * @param {string} id Storage ID
     * @return {this}
     * */
    setCurrent(id) {
      c.currentStorage = id;
      return this;
    },

    /**
     * Store key-value resources in the current storage
     * 存储当前存储中的键值资源
     * @param  {Object} data Data in key-value format, eg. {item1: value1, item2: value2}
     * @param {Function} clb Callback function
     * @return {Object|null}
     * @example
     * storageManager.store({item1: value1, item2: value2});
     * */
    store(data, clb) {
      var st = this.get(this.getCurrent());
      var dataF = {};

      for(var key in data)
        dataF[c.id + key] = data[key];

      return st ? st.store(dataF, clb) : null;
    },

    /**
     * Load resource from the current storage by keys
     * 通过键加载来自当前存储的资源
     * @param  {string|Array<string>} keys Keys to load
     * @param {Function} clb Callback function
     * @return {Object|null} Loaded resources
     * @example
     * var data = storageManager.load(['item1', 'item2']);
     * // data -> {item1: value1, item2: value2}
     * var data2 = storageManager.load('item1');
     * // data2 -> {item1: value1}
     * */
    load(keys, clb) {
      var st = this.get(this.getCurrent());
      var keysF = [];
      var result = {};

      if(typeof keys === 'string')
        keys = [keys];

      for (var i = 0, len = keys.length; i < len; i++)
        keysF.push(c.id + keys[i]);

      var loaded = st ? st.load(keysF, clb) : {};

      // Restore keys name
      // 恢复密钥名称
      for (var itemKey in loaded){
        var reg = new RegExp('^' + c.id + '');
        var itemKeyR = itemKey.replace(reg, '');
        result[itemKeyR] = loaded[itemKey];
      }

      return result;
    },

    /**
     * Load default storages
     * 加载默认存储
     * @return {this}
     * @private
     * */
    loadDefaultProviders() {
      for (var id in defaultStorages)
        this.add(id, defaultStorages[id]);
      return this;
    },

    /**
     * Get configuration object
     * 获取配置对象
     * @return {Object}
     * @private
     * */
    getConfig() {
      return c;
    },

  };

};
