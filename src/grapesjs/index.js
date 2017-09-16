 module.exports = (config => {
  
  var c = config || {},
  defaults      = require('./config/config'), // 配置文件
  Editor        = require('editor'),          // 编辑器
  PluginManager = require('plugin_manager');  // 插件控制器

  var plugins = new PluginManager(); // 实例化插件
  var editors = []; // 定义一个控制器数组，目前来看，是可以定义多个编辑器的
 
  return {

    editors, // 编辑器，可以是多个编辑器可以做多个页面用

    plugins, // 插件

    /**
     * Initializes an editor based on passed options
     * 根据传递的选项初始化编辑器。
     * @param {Object} config Configuration object 配置对象
     * @param {string} config.container Selector which indicates where render the editor 选择器，用于指示编辑器的呈现位置。
     * @param {Object|string} config.components='' HTML string or Component model in JSON format JSON格式的HTML字符串或组件模型
     * @param {Object|string} config.style='' CSS string or CSS model in JSON format CSS CSS JSON格式的字符串或模型
     * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container 如果为true，将从选定容器中获取HTML和CSS。
     * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl+c) & paste(ctrl+v) components 启用/禁用复制（ctrl + c）和粘贴（ctrl + v）组件的可能性
     * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager  启用/禁用撤消管理器
     * @param {Array} [config.plugins=[]] Array of plugins to execute on start 开始执行的插件数组
     * @return {grapesjs.Editor} GrapesJS editor instance grapesjs编辑实例
     * @example
     * var editor = grapesjs.init({
     *   container: '#myeditor',
     *   components: '<article class="hello">Hello world</article>',
     *   style: '.hello{color: red}',
     * })
     */
    init(config) {
      // config 传递过来的参数
      var c   = config || {};
      var els = c.container; // 定义编辑器的 ID

      // Make a missing $ more verbose
      // 使一个缺少$更详细
      if (typeof $ == 'undefined') {
        throw 'jQuery not found';
      }

      // Set default options
      // 设置默认选项 defaults 里面放的是默认属性
      // defaults 是配置文件里面参数
      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }
      console.log(c);
      if(!els)
        throw new Error("'container' is required");

      c.el = document.querySelector(els); // 容器的 Dom 
      
      var editor = new Editor(c).init(); // 调用的编辑的的方法 

      // Execute plugins
      // 执行插件
      var plugs = plugins.getAll();
      // 执行默认的插件
      c.plugins.forEach((pluginId) => {
        let plugin = plugins.get(pluginId);

        if (plugin) {
          plugin(editor, c.pluginsOpts[pluginId] || {});
        } else {
          console.warn(`Plugin ${pluginId} not found`);
        }
      });
      // autorender: 如果TRUE在init上呈现编辑器,默认是 true
      if(c.autorender)
        editor.render();

      editors.push(editor);
      return editor;
    },

  };

})();
/**
 * 
 */
