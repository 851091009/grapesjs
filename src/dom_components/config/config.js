module.exports = {
  stylePrefix: 'comp-',

  wrapperId: 'wrapper',

  wrapperName: 'Body',

  // Default wrapper configuration
  // 违约包装结构
  wrapper: {
    style: {margin: 0},
    removable: false,
    copyable: false,
    draggable: false,
    components: [],
    traits: [],
    stylable: ['background','background-color','background-image',
      'background-repeat','background-attachment','background-position'],
  },

  // Could be used for default components
  // 可用于默认组件
  components: [],

  // Class for new image component
  // 新图像组件类
  imageCompClass: 'fa fa-picture-o',

  // Open assets manager on create of image component
  // 创建映像组件时打开资产管理器
  oAssetsOnCreate: true,

  // TODO to remove
  // Editor should also store the wrapper informations, but as this change might
  // break stuff I set ii as an opt-in option, for now.
  //全部消除
  // 编辑还应包店的信息，但这种可能的变化
  // 打破的东西I / II的一集的选择，在选择，是现在。
  storeWrapper: 0,

  // List of void elements
  // 虚元素列表
  voidElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source',
    'track', 'wbr'],
};
