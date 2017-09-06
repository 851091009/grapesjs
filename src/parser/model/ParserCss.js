module.exports = config => ({
  /**
   * Parse selector string to array.
   * Only classe based are valid as CSS rules inside editor, not valid
   * selectors will be dropped as additional
   * It's ok with the last part of the string as state (:hover, :active)
   *
   * 将数组的选择符串解析。
   * 只有基于classe是有效的作为CSS规则编辑器内，无效
   * 选择器将被删除
   * 作为状态（：hover，：active），字符串的最后一部分就可以了
   * @param  {string} str Selectors string
   * @return {Object}
   * @example
   * var res = ParserCss.parseSelector('.test1, .test1.test2, .test2 .test3');
   * console.log(res);
   * // {
   * //result: [['test1'], ['test1', 'test2']],
   * //add: ['.test2 .test3']
   * //}
   */
  parseSelector(str) {
    var add = [];
    var result = [];
    var sels = str.split(',');
    for (var i = 0, len = sels.length; i < len; i++) {
      var sel = sels[i].trim();
      // Will accept only concatenated classes and last
      // class might be with state (eg. :hover), nothing else.

      // 将接受只有连接的类和最后一个
      // 类可能与状态（例如：hover），没有别的。
      if (/^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/ig.test(sel)) {
        var cls = sel.split('.').filter(Boolean);
        result.push(cls);
      } else {
        add.push(sel);
      }
    }
    return {
      result,
      add,
    };
  },

  /**
   * Fetch data from node
   * 从节点获取数据
   * @param  {StyleSheet|CSSMediaRule} el
   * @return {Array<Object>}
   */
  parseNode(el) {
    var result = [];
    var nodes = el.cssRules;

    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      var sels = node.selectorText;
      var selsAdd = [];

      // It's a CSSMediaRule
      if(node.cssRules) {
        var subRules = this.parseNode(node);
        var mediaText = node.media.mediaText;

        for( var s = 0, lens = subRules.length; s < lens; s++) {
          var subRule = subRules[s];
          subRule.mediaText = mediaText ? mediaText.trim() : '';
        }

        result = result.concat(subRules);
      }

      if(!sels)
        continue;

      var selsParsed = this.parseSelector(sels);
      sels = selsParsed.result;
      selsAdd = selsParsed.add;

      // Create style object from the big one
      // 从大的创建样式对象
      var stl = node.style;
      var style = {};
      for (var j = 0, len2 = stl.length; j < len2; j++) {
        var propName = stl[j];
        var important = stl.getPropertyPriority(propName);
        style[propName] = stl[propName] +
          (important ? ' !' + important : '');
      }

      var lastRule = '';
      // For each group of selectors
      // 对于每组选择器
      for (var k = 0, len3 = sels.length; k < len3; k++) {
        var selArr = sels[k];
        var model = {};

        // Isolate state from selector
        // 从选择器分离状态
        var stateArr = selArr[selArr.length - 1].split(/:(.+)/);
        if(stateArr[1]){
          selArr[selArr.length - 1] = stateArr[0];
          model.state = stateArr[1];
          stateArr.splice(stateArr.length - 1, 1);
        }

        model.selectors = selArr;
        model.style = style;
        lastRule = model;
        result.push(model);
      }

      // Need to push somewhere not class-based selectors, if some rule was
      // created will push them there, otherwise will create a new rule

      // 如果某些规则是需要推送某个地方不是基于类的选择器
      // 创建将它们推送到那里，否则将创建一个新的规则
      if (selsAdd.length) {
        var selsAddStr = selsAdd.join(', ');
        if (lastRule) {
          lastRule.selectorsAdd = selsAddStr;
        } else {
          result.push({
            selectors: [],
            selectorsAdd: selsAddStr,
            style,
          });
        }
      }

    }

    return result;
  },

  /**
   * Parse CSS string to a desired model object
   * 将CSS字符串解析为所需的模型对象
   * @param  {string} str HTML string
   * @return {Object|Array<Object>}
   */
  parse(str) {
    var el = document.createElement('style');
    /*
    el.innerHTML = ".cssClass {border: 2px solid black; background-color: blue;} " +
    ".red, .red2 {color:red; padding:5px} .test1.red {color:black} .red:hover{color: blue} " +
    "@media screen and (min-width: 480px){ .red{color:white} }";
    */
    el.innerHTML = str;

    // There is no .sheet without adding it to the <head>
    // 没有将其添加到<head>中
    document.head.appendChild(el);
    var sheet = el.sheet;
    document.head.removeChild(el);
    var result = this.parseNode(sheet);

    if(result.length == 1)
      result = result[0];

    return result;
  }
});
