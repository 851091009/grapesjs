module.exports = {
  // If true renders editor on init
  // 如果TRUE在init上呈现编辑器
  autorender: 1,

  // Where init the editor
  // 编辑器的初始化容器
  container: '',

  // HTML string or object of components
  // HTML字符串或组件对象
  components: '',

  // CSS string or object of rules
  // CSS字符串或规则对象
  style: '',

  // If true, will fetch HTML and CSS from selected container
  // 如果为true，将从选定容器中获取HTML和CSS。
  fromElement: 0,

  // ---
  // Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components
  // 启用/禁用复制（ctrl + c）和粘贴（ctrl + v）组件的可能性
  copyPaste: true,

  // Enable/Disable undo manager
  // 启用/禁用撤销管理器
  undoManager: true,

  // Storage Manager
  // 存储管理器
  storageManager: {},

  // Array of plugins to init
  // 插件添加到数组
  plugins: [],

  // Custom options for plugins
  // 插件的自定义选项
  pluginsOpts: {}
};
