module.exports = {
  // Prefix identifier that will be used inside storing and loading
  // 将在存储和加载中使用的前缀标识符
  id: 'gjs-',

  // Enable/Disable autosaving
  // 启用/禁用自动保存
  autosave: 1,

  // Indicates if load data inside editor after init
  // 指示init后的编辑器中是否加载数据
  autoload: 1,

  // Indicates which storage to use. Available: local | remote
  // 指示要使用的存储空间。 可用：本地| 远程
  type: 'local',

  // If autosave enabled, indicates how many steps (general changes to structure)
  // 如果启用自动保护，则指示有多少步骤（结构的一般更改）
  // need to be done before save. Useful with remoteStorage to reduce remote calls
  // 保存前需要完成。 与remoteStorage有用以减少远程调用
  stepsBeforeSave: 1,

  //Enable/Disable components model (JSON format)
  // 启用/禁用组件模型（JSON格式）
  storeComponents: false,

  // Enable/Disable styles model (JSON format)
  // 启用/禁用样式模型（JSON格式）
  storeStyles: false,

  // Enable/Disable saving HTML template
  // 启用/禁用保存HTML模板
  storeHtml: true,

  // Enable/Disable saving HTML template
  // 启用/禁用保存HTML模板
  storeCss: true,

  // ONLY FOR LOCAL STORAGE
  // 仅限本地存储
  // If enabled, checks if browser supports Local Storage
  // 如果启用，请检查浏览器是否支持本地存储
  checkLocal: true,

  // ONLY FOR REMOTE STORAGE
  // 仅用于远程存储
  // Custom params that should be passed with each store/load request
  // 每个存储/加载请求应该传递的自定义参数
  params: {},

  // Endpoint where to save all stuff
  // 端点在哪里可以保存所有的东西
  urlStore: '',

  // Endpoint where to fetch data
  // 端点在哪里获取数据
  urlLoad: '',

  // Callback before request
  // 请求前回拨
  beforeSend(jqXHR, settings) {},

  // Callback after request
  // 请求后回叫
  onComplete(jqXHR, status) {},

  // set contentType paramater of $.ajax
  // 设置 contentType 参数 $.ajax
  // true: application/json; charset=utf-8'
  // false: 'x-www-form-urlencoded'
  contentTypeJson: false

};
