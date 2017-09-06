module.exports = () => {
  var c = {},
  defaults   = require('./config/config'),
  Traits     = require('./model/Traits'),
  TraitsView = require('./view/TraitsView');
  var TraitsViewer;

  return {

    TraitsView,

    /**
     * Name of the module
     * @type {String}
     * @private
    */
    name: 'TraitManager',

    /**
     * Get configuration object
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
      TraitsViewer = new TraitsView({
        collection: [],
        editor: c.em,
        config: c,
      });
      return this;
    },

    /**
     * Get Traits viewer
     * 获得性状查看器
     * @private
     */
    getTraitsViewer() {
      return TraitsViewer;
    },

    /**
     * Add new trait type
     * 添加新的特性类型
     * @param {string} name Type name
     * @param {Object} methods Object representing the trait
     */
    addType(name, trait) {
      var itemView = TraitsViewer.itemView;
      TraitsViewer.itemsView[name] = itemView.extend(trait);
    },

    /**
     * Get trait type
     * 获得性状类型
     * @param {string} name Type name
     * @return {Object}
     */
    getType(name) {
      return TraitsViewer.itemsView[name];
    },

  };
};
