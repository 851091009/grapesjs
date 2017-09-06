/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getCategories](#getcategories)
 * * [render](#render)
 *
 * Block manager helps managing various, draggable, piece of contents that could be easily reused inside templates.
 * 块的经理帮助管理各种，可拖动，内容可以很容易地重用模板块。
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 *
 * ```js
 * var blockManager = editor.BlockManager;
 * ```
 *
 * @module BlockManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.blocks=[]] Default blocks 默认块
 * @example
 * ...
 * {
 *     blocks: [
 *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
 *      ...
 *    ],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults        = require('./config/config'),
  Blocks          = require('./model/Blocks'),
  BlockCategories = require('./model/Categories'),
  BlocksView      = require('./view/BlocksView');
  var blocks, view;
  var categories = [];

  return {

      /**
       * 模块名称
       * @type {String}
       * @private
       */
      name: 'BlockManager',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * 初始化模块。使用编辑器的新实例自动调用
       * @param {Object} config Configurations
       * @return {this}
       * @private
       */
      init(config) {
        c = config || {};
        for (var name in defaults) {
          if (!(name in c))
            c[name] = defaults[name];
        }
        blocks = new Blocks(c.blocks);
        categories = new BlockCategories(),
        view = new BlocksView({
          collection: blocks,
          categories,
        }, c);
        return this;
      },

      /**
       * Add new block to the collection.
       * 向集合中添加新的块。
       * @param {string} id Block id
       * @param {Object} opts Options 选项
       * @param {string} opts.label Name of the block 块的名称
       * @param {string} opts.content HTML content HTML内容
       * @param {string|Object} opts.category Group the block inside a catgegory.
       *                                      You should pass objects with id property, eg:
       *                                      {id: 'some-uid', label: 'My category'}
       *                                      The string will be converted in:
       *                                      'someid' => {id: 'someid', label: 'someid'}
       * 
       *                                      将块组合在一个集合中。
       *                                      你应该传递具有id属性的对象，例如：
       *                                      {id：'some-uid'，label：'我的类别'}
       *                                      字符串将转换为：
       *                                      'someid'=> {id：'someid'，label：'someid'}
       * @param {Object} [opts.attributes={}] Block attributes
       * @return {Block} Added block
       * @example
       * blockManager.add('h1-block', {
       *   label: 'Heading',
       *   content: '<h1>Put your title here</h1>',
       *   category: 'Basic',
       *   attributes: {
       *     title: 'Insert h1 block'
       *   }
       * });
       */
      add(id, opts) {
        var obj = opts || {};
        obj.id = id;
        return blocks.add(obj);
      },

      /**
       * Return the block by id
       * 按id返回块
       * @param  {string} id Block id
       * @example
       * var block = blockManager.get('h1-block');
       * console.log(JSON.stringify(block));
       * // {label: 'Heading', content: '<h1>Put your ...', ...}
       */
      get(id) {
        return blocks.get(id);
      },

      /**
       * Return all blocks
       * @return {Collection}
       * @example
       * var blocks = blockManager.getAll();
       * console.log(JSON.stringify(blocks));
       * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
       */
      getAll() {
        return blocks;
      },

      /**
       * Get all available categories.
       * 获取所有可用的类别。
       * Is possible to add categories only with blocks via 'add()' method
       * 可能只有通过“add（）”方法的块添加类别
       * @return {Array|Collection}
       */
      getCategories() {
        return categories;
      },

      /**
       * Render blocks
       * @return {HTMLElement}
       */
      render() {
        return view.render().el;
      },

      /**
       * Remove block by id
       * 按ID删除块
       * @param {string} id Block id
       * @return {Block} Removed block
       */
      remove(id) {
        return blocks.remove(id);
      },

  };

};
