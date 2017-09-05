module.exports = {
  // Style prefix
  // CSS 风格的前缀
  stylePrefix: 'gjs-',

  //TEMP
  components: '',

  // Enable/Disable possibility to copy(ctrl + c) & paste(ctrl + v) components
  // 启用/禁用复制（Ctrl + C）和粘贴（Ctrl + V）组件的可能性
  copyPaste: true,

  // Show an alert before unload the page with unsaved changes
  // 之前卸载网页未保存的更改显示警报
  noticeOnUnload: true,

  // Enable/Disable undo manager
  // 启用/禁用撤消管理器
  undoManager: true,

  // Show paddings and margins
  // 显示内边距和外边距
  showOffsets: false,

  // Show paddings and margins on selected component
  // 显示芯子和选定的组件的利润
  showOffsetsSelected: false,

  // Clear the canvas when editor.render() is called
  // 清除画布时，（）被称为编辑。
  clearOnRender: false,

  // On creation of a new Component (via object), if the 'style' attribute is not 关于创建一个新组件（通过对象），如果“样式”属性不是
  // empty, all those roles will be moved in its new class 空，所有角色将在新的类中移动。
  forceClass: true,

  // Height for the editor container
  // 编辑器容器的高度
  height: '900px',

  // Width for the editor container
  // 编辑器容器的宽度
  width: '100%',

  // CSS that could only be seen (for instance, inside the code viewer)
  // 只能看到的CSS（例如，代码查看器内）
  protectedCss: '*{box-sizing: border-box;}',

  // CSS for the iframe which containing the canvas, useful if you need to custom something inside
  // CSS for the which the Canvas iframe含有用，如果你需要自定义的内心
  // (eg. the style of the selected component)
  // （例如所选组件的样式）
  canvasCss: '',

  // Default command
  // 默认命令
  defaultCommand: 'select-comp',

  // Show a toolbar when the component is selected
  // 当组件被选中时显示工具栏。
  showToolbar: 1,

  // Allow script tag importing
  // 允许脚本标记导入
  allowScripts: 0,

  // If true render a select of available devices
  // 如果TRUE提供可用设备的选择
  showDevices: 1,

  // When enabled, on device change media rules won't be created
  // 启用时，将不会创建设备更改媒体规则。
  devicePreviewMode: 0,

  // THe condition to use for media queries, eg. 'max-width'
  // 用于媒体查询的条件，如“最大宽度”
  // Comes handy for mobile-first cases
  // 方便移动第一案件
  mediaCondition: 'max-width',

  // Starting tag for variable inside scripts in Components
  // 用于组件内变量内脚本的起始标记
  tagVarStart: '{[ ',

  // Ending tag for variable inside scripts in Components
  // 组件中变量内脚本的结束标记
  tagVarEnd: ' ]}',

  // This option makes available custom component types also for loaded
  // 此选项还提供用于加载的自定义组件类型。
  // elements inside canvas
  // 元素内的帆布
  loadCompsOnRender: 1,

  // Return JS of components inside HTML from 'editor.getHtml()'
  // 返回js组件在HTML的编辑。gethtml()
  jsInHtml: true,

  // Show the wrapper component in the final code, eg. in editor.getHtml()
  // 在最终代码中显示包装器组件，例如 editor.getHtml()
  exportWrapper: 0,

  // The wrapper, if visible, will be shown as a `<body>`
  // 包装器，如果可见，将显示为 `<body>`
  wrappesIsBody: 1,

  // Dom element
  // DOM元素
  el: '',

  // Configurations for Asset Manager
  // 资产管理器的配置
  assetManager: {},

  // Configurations for Canvas
  // 配置的帆布
  canvas: {},

  // Configurations for Layers
  // 配置for层
  layers: {},

  // Configurations for Storage Manager
  // 存储管理器的配置
  storageManager: {},

  // Configurations for Rich Text Editor
  // 富文本编辑器的配置
  rte: {},

  // Configurations for DomComponents
  // DOM组件的配置
  domComponents: {},

  // Configurations for Modal Dialog
  // 模式对话框的配置
  modal: {},

  // Configurations for Code Manager
  // 代码管理器的配置
  codeManager: {},

  // Configurations for Panels
  // 配置面板
  panels: {},

  // Configurations for Commands
  // 配置命令
  commands: {},

  // Configurations for Css Composer
  // CSS作曲家的配置
  cssComposer: {},

  // Configurations for Selector Manager
  // 选择器管理器的配置
  selectorManager: {},

  // Configurations for Device Manager
  // 设备管理器的配置
  deviceManager: {
    devices: [{
        name: 'Desktop',
        width: '',
      },{
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px',
      },{
        name: 'Mobile landscape',
        width: '568px',
        widthMedia: '768px',
      },{
        name: 'Mobile portrait',
        width: '320px',
        widthMedia: '480px',
    }],
  },

  // Configurations for Style Manager
  // 样式管理器的配置
  styleManager: {

    sectors: [{
        name: 'General',
        open: false,
        buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
      },{
        name: 'Dimension',
        open: false,
        buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
      },{
        name: 'Typography',
        open: false,
        buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
        properties: [{
            property: 'text-align',
            list        : [
                {value: 'left', className: 'fa fa-align-left'},
                {value: 'center', className: 'fa fa-align-center' },
                {value: 'right', className: 'fa fa-align-right'},
                {value: 'justify', className: 'fa fa-align-justify'}
            ],
        }]
      },{
        name: 'Decorations',
        open: false,
        buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
      },{
        name: 'Extra',
        open: false,
        buildProps: ['transition', 'perspective', 'transform'],
      }],

  },

  // Configurations for Block Manager
  // 块管理器的配置
  blockManager: {},

};
