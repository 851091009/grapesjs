/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 * 在使用方法之前，您应该首先从编辑器实例中获取模块，以这种方式：
 *
 * ```js
 * var deviceManager = editor.DeviceManager;
 * ```
 *
 * @module DeviceManager
 */
module.exports = () => {
  var c = {},
  defaults    = require('./config/config'),
  Devices     = require('./model/Devices'),
  DevicesView = require('./view/DevicesView');
  var devices, view;

  return {

      /**
       * Name of the module
       * 模块名称
       * @type {String}
       * @private
       */
      name: 'DeviceManager',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       * @param {Array<Object>} [config.devices=[]] Default devices
       * @example
       * ...
       * {
       *    devices: [
       *      {name: 'Desktop', width: ''}
       *      {name: 'Tablet', width: '991px'}
       *    ],
       * }
       * ...
       * @return {this}
       */
      init(config) {
        c = config || {};
        for (var name in defaults) {
          if (!(name in c))
            c[name] = defaults[name];
        }

        devices = new Devices(c.devices);
        view = new DevicesView({
          collection: devices,
          config: c
        });
        return this;
      },

      /**
       * Add new device to the collection. URLs are supposed to be unique
       * 向集合中添加新设备。URL应该是唯一的。
       * @param {string} name Device name
       * @param {string} width Width of the device
       * @param {Object} opts Custom options
       * @return {Device} Added device
       * @example
       * deviceManager.add('Tablet', '900px');
       */
      add(name, width, opts) {
        var obj = opts || {};
        obj.name = name;
        obj.width = width;
        return devices.add(obj);
      },

      /**
       * Return device by name
       * 按名称返回设备
       * @param  {string} name Name of the device
       * @example
       * var device = deviceManager.get('Tablet');
       * console.log(JSON.stringify(device));
       * // {name: 'Tablet', width: '900px'}
       */
      get(name) {
        return devices.get(name);
      },

      /**
       * Return all devices
       * 将所有设备
       * @return {Collection}
       * @example
       * var devices = deviceManager.getAll();
       * console.log(JSON.stringify(devices));
       * // [{name: 'Desktop', width: ''}, ...]
       */
      getAll() {
        return devices;
      },

      /**
       * Render devices
       * 渲染器
       * @return {string} HTML string
       * @private
       */
      render() {
        return view.render().el;
      },

  };

};
