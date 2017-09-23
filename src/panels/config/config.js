var crc  = 'create-comp';
var mvc  = 'move-comp';
var swv  = 'sw-visibility';
var expt = 'export-template';
var osm = 'open-sm';
var otm = 'open-tm';
var ola = 'open-layers';
var obl = 'open-blocks';
var ful = 'fullscreen';
var prv = 'preview';

module.exports = {
  stylePrefix: 'pn-',

  // Default panels fa-sliders for features
  // 默认面板fa滑块的功能
  defaults: [{
    id: 'commands',
    buttons: [{}],
  },{
    id: 'options',
    buttons: [{
      active: true,
      id: swv,
      className: 'fa fa-square-o',
      command: swv,
      context: swv,
      attributes: { title: 'View components' }, // 查看组件
    },{
      id: prv,
      className: 'fa fa-eye',
      command: prv,
      context: prv,
      attributes: { title: 'Preview' }, // 预览
    },{
      id: ful,
      className: 'fa fa-arrows-alt',
      command: ful,
      context: ful,
      attributes: { title: 'Fullscreen' }, // 全屏
    },{
      id: expt,
      className: 'fa fa-code',
      command: expt,
      attributes: { title: 'View code' }, // 查看代码
    }],
  },{
    id: 'views',
    buttons  : [{
      id: osm,
      className: 'fa fa-paint-brush',
      command: osm,
      active: true,
      attributes: { title: 'Open Style Manager' }, // 打开样式管理器
    },{
      id: otm,
      className: 'fa fa-cog',
      command: otm,
      attributes: { title: 'Settings' },// 设置
    },{
      id: ola,
      className: 'fa fa-bars',
      command: ola,
      attributes  : { title: 'Open Layer Manager' },// 打开图层管理器
    },{
      id: obl,
      className: 'fa fa-th-large',
      command: obl,
      attributes  : { title: 'Open Blocks' },// 打开块
    }],
  }],

  // Editor model
  // 编辑模式
  em : null,

  // Delay before show children buttons (in milliseconds)
  // 展示之前的延迟按钮（以毫秒为单位）
  delayBtnsShow  : 300,
};
