module.exports =  {
  // Default assets
  // 默认资产
  assets: [],

  // Style prefix
  // 样式前缀
  stylePrefix: 'am-',

  // Upload endpoint, set `false` to disable upload
  // 上传端点，设置`false`以禁用上传
  // upload: 'https://endpoint/upload/assets',
  // upload: false,
  upload: 0,

  // The name used in POST to pass uploaded files
  // POST中使用的名称传递上传的文件
  uploadName: 'files',

  // Custom headers to pass with the upload request
  // 自定义标头与上传请求一起传递
  headers: {},

  // Custom parameters to pass with the upload request, eg. csrf token
  // 自定义参数通过上传请求，例如 csrf令牌
  params: {},

  // If true, tries to add automatically uploaded assets.
  // 如果为true，则尝试添加自动上传的资源。
  // To make it work the server should respond with a JSON containing assets
  // 为了使其工作，服务器应该使用包含JSON的资产进行响应
  // in a data key, eg:
  // 在数据密钥中，例如：
  // {
  //  data: [
  //    'https://.../image.png',
  //    ...
  //    {src: 'https://.../image2.png'},
  //    ...
  //  ]
  // }
  autoAdd: 1,

  // Text on upload input
  // 上传输入文字
  uploadText: 'Drop files here or click to upload',

  // Label for the add button
  // 添加按钮的标签
  addBtnText: 'Add image',

  // Custom uploadFile function
  // 自定义uploadFile功能
  // @example
  // uploadFile: function(e) {
  //   var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  //   // ...send somewhere
  // }
  uploadFile: '',

  // Enable an upload dropzone on the entire editor (not document) when dragging
  // 在拖动时，在整个编辑器（而不是文档）上启用一个上传放置区域
  // files over it
  // 档案
  dropzone: 1,

  // Open the asset manager once files are been dropped via the dropzone
  // 一旦文件通过dropzone删除，就打开资产管理器
  openAssetsOnDrop: 1,

  // Any dropzone content to append inside dropzone element
  // 任何dropzone内容附加在dropzone元素内
  dropzoneContent: '',
};
