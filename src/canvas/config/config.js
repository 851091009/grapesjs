module.exports = {

  stylePrefix: 'cv-',

  // Coming soon
  // 马上就来
  rulers: false,

  /*
   * Append external scripts in head of the iframe before renderBody content 
   * 添加外部脚本在iframe的头在renderbody内容
   * In this case, you have to add them manually later in the final HTML page
   * 在这种情况下，您必须在后面的HTML页面中手动添加它们。
   * @example
   * scripts: [
   *  'https://...',
   * ]
  */
  scripts: [],

  /*
   * Append external styles. This styles won't be added to the final HTML/CSS
   * 添加外部样式。此样式不会添加到最终的HTML / CSS中。
   * @example
   * styles: [  
   *  'https://...',
   * ]
  */
  styles: [],

  /**
   * Add custom badge naming strategy
   * 添加自定义标记命名策略
   * @example
   * customBadgeLabel: function(ComponentModel) {
   *  return ComponentModel.getName();
   * }
   */
  customBadgeLabel: '',

};
