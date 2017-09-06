const Model = Backbone.Model;
const View = Backbone.View;

export default {

  initialize(models, opts) {
    this.model = (attrs = {}, options = {}) => {
      let Model, type;

      if (attrs && attrs.type) {
        type = this.getType(attrs.type);
        Model = type ? type.model : this.getBaseType().model;
      } else {
        const typeFound = this.recognizeType(attrs);
        type = typeFound.type;
        Model = type.model;
        attrs = typeFound.attributes;
      }

      const model = new Model(attrs, options);
      model.typeView = type.view;
      return model;
    };
    const init = this.init && this.init.bind(this);
    init && init();
  },

  /**
   * Recognize type by any value
   * 通过任何值识别类型
   * @param  {mixed} value
   * @return {Object} Found type
   */
  recognizeType(value) {
    const types = this.getTypes();

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      let typeFound = type.isType(value);
      typeFound = typeof typeFound == 'boolean' && typeFound ?
        {type: type.id} : typeFound;

      if (typeFound) {
        return {
          type,
          attributes: typeFound,
        };
      }
    }

    // If, for any reason, the type is not found it'll return the base one
    // 如果由于任何原因找不到该类型，则返回基本类型
    return {
      type: this.getBaseType(),
      attributes: value,
    }
  },

  /**
   * Returns the base type (last object in the stack)
   * 返回基本类型（堆栈中的最后一个对象）
   * @return {Object}
   */
  getBaseType() {
    const types = this.getTypes();
    return types[types.length - 1];
  },

  /**
   * Get types
   * 获取类型
   * @return {Array}
   */
  getTypes() {
    return [];
  },

  /**
   * Get type
   * 获取类型
   * @param {string} id Type ID
   * @return {Object} Type definition
   */
  getType(id) {
    const types = this.getTypes();

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type.id === id) {
        return type;
      }
    }
  },

  /**
   * Add new type
   * 添加新的类型
   * @param {string} id Type ID
   * @param {Object} definition Definition of the type. Each definition contains
   *                            `model` (business logic), `view` (presentation logic)
   *                            and `isType` function which recognize the type of the
   *                            passed entity
   * addType('my-type', {
   *  model: {},
   *  view: {},
   *  isType: (value) => {},
   * })
   */
  addType(id, definition) {
    const type = this.getType(id);
    let {model, view, isType} = definition;
    model = model instanceof Model ? model : Model.extend(model);
    view = view instanceof View ? view : View.extend(view);

    if (type) {
      type.model = model;
      type.view = view;
      type.isType = isType || type.isType;
    } else {
      definition.id = id;
      definition.model = model;
      definition.view = view;
      this.getTypes().unshift(definition);
    }
  }
}
