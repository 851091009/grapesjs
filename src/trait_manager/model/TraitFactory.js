var Backbone = require('backbone');

module.exports = (() => ({
  /**
   * Build props object by their name
   * 他们的名字对象生成的道具。
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props) {
    var objs = [];

    if(typeof props === 'string')
      props = [props];

    for (var i = 0; i < props.length; i++) {
      var obj = {};
      var prop = props[i];
      obj.name = prop;

      // Define type
      // 定义类型
      switch (prop) {
        case 'target':
          obj.type = 'select';
          break;
      }

      // Define placeholder
      // 定义占位符
      switch (prop) {
        case 'title': case 'alt': case 'id':
          obj.placeholder = 'eg. Text here';
          break;
        case 'href':
          obj.placeholder = 'eg. https://google.com';
          break;
      }


      // Define options
      // 定义选项
      switch (prop) {
        case 'target':
          obj.options = [
            {value: '', name: 'This window'},
            {value: '_blank', name: 'New window'}
          ];
          break;
      }

      objs.push(obj);
    }

    return objs;
  }
}))();
