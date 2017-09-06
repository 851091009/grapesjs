var StyleManager = require('style_manager');

module.exports = {

  run(em, sender) {
    this.sender  = sender;
    if(!this.$cn){
      var config    = em.getConfig(),
          panels    = em.Panels;
      // Main container
      // 主容器
      this.$cn = $('<div/>');
      // Secondary container
      // 二手集装箱
      this.$cn2 = $('<div/>');
      this.$cn.append(this.$cn2);

      // Device Manager
      // 设备管理器
      var dvm = em.DeviceManager;
      if(dvm && config.showDevices){
        var devicePanel = panels.addPanel({ id: 'devices-c'});
        devicePanel.set('appendContent', dvm.render()).trigger('change:appendContent');
      }

      // Class Manager container
      // 经理类容器
      var clm = em.SelectorManager;
      if(clm)
        this.$cn2.append(clm.render([]));

      this.$cn2.append(em.StyleManager.render());
      var smConfig = em.StyleManager.getConfig();
      // Create header
      // 创建标题
      this.$header  = $('<div>', {
        class: smConfig.stylePrefix + 'header',
        text: smConfig.textNoElement,
      });
      //this.$cn = this.$cn.add(this.$header);
      this.$cn.append(this.$header);

      // Create panel if not exists
      // 如果不存在，则创建面板
      if(!panels.getPanel('views-container'))
        this.panel  = panels.addPanel({ id: 'views-container'});
      else
        this.panel  = panels.getPanel('views-container');

      // Add all containers to the panel
      // 将所有容器添加到面板中
      this.panel.set('appendContent', this.$cn).trigger('change:appendContent');

      this.target = em.editor;
      this.listenTo( this.target ,'change:selectedComponent', this.toggleSm);
    }
    this.toggleSm();
  },

  /**
   * Toggle Style Manager visibility
   * 切换样式管理器可见性
   * @private
   */
  toggleSm() {
      if(!this.sender.get('active'))
        return;
      if(this.target.get('selectedComponent')){
          this.$cn2.show();
          this.$header.hide();
      }else{
          this.$cn2.hide();
          this.$header.show();
      }
  },

  stop() {
    // Hide secondary container if exists
    // 如果存在，则隐藏次要容器
    if(this.$cn2)
      this.$cn2.hide();

    // Hide header container if exists
    // 隐藏标题容器是否存在
    if(this.$header)
      this.$header.hide();
  }
};
