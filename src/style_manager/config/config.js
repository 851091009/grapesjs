module.exports = {
  stylePrefix: 'sm-',

  sectors: [],

  // Text to show in case no element selected
  // 如果没有选定元素，则显示文本
  textNoElement: 'Select an element before using Style Manager',

  // Hide the property in case it's not stylable for the 隐藏属性的情况下，不可设置样式为
  // selected component (each component has 'stylable' property) 选择的组件（每个组件的可设置样式属性）
  hideNotStylable: true,

  // Highlight changed properties of the selected component
  // 突出显示所选组件的更改属性
  highlightChanged: true,

  // Highlight computed properties of the selected component
  // 突出显示选定组件的计算属性。
  highlightComputed: true,

  // Show computed properties of the selected component, if this value 显示所选组件的计算属性，如果这个值
  // is set to false, highlightComputed will not take effect 设置为false，highlightcomputed不会生效
  showComputed: true,

  // Adds the possibility to clear property value from the target style 添加从目标样式中清除属性值的可能性。
  clearProperties: false,

  // Properties which are valid to be shown as computed 有效的属性，如计算所示。
  // (Identified as inherited properties: https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance)
  validComputed: ['border-collapse', 'border-spacing', 'caption-side', 'color', 'cursor', 'direction', 'empty-cells',
  'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'font-size-adjust', 'font-stretch', 'font',
  'letter-spacing', 'line-height', 'list-style-image', 'list-style-position', 'list-style-type', 'list-style', 'orphans',
  'quotes', 'tab-size', 'text-align', 'text-align-last', 'text-decoration-color', 'text-indent', 'text-justify',
  'text-shadow', 'text-transform', 'visibility', 'white-space', 'widows', 'word-break', 'word-spacing', 'word-wrap'],
};
