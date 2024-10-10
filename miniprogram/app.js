App({
  globalData: {
    user_openid: null, // 初始化 user_openid 为 null
    userInfo: null,
    hasAgreedPrivacyPolicy: false     // 可选：存储用户信息
  },

  /**
   * 小程序初始化时执行
   */
  onLaunch: function() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'fufubuff-3gt0b01y042179cc', // 请替换为您的云开发环境 ID
      traceUser: true, // 是否在用户访问记录中显示用户信息，建议开启
    });

    // 可选：自动登录检查
    const openid = this.getUserOpenid();
    if (openid) {
      // 可选：根据需要自动跳转到主页面
      // wx.switchTab({
      //   url: '/pages/square/square'
      // });
    }
  },

  /**
   * 设置全局的 user_openid
   * @param {String} openid - 用户的 openid
   */
  setUserOpenid: function(openid) {
    this.globalData.user_openid = openid;
    // 同时将 openid 存储到本地缓存，以便下次启动时读取
    console.log('Global user_openid set to:', openid); 
  },

  /**
   * 获取全局的 user_openid
   * @returns {String} 用户的 openid
   */
  getUserOpenid: function() {
    if (this.globalData.user_openid) {
      return this.globalData.user_openid;
    } else {
      const openid = wx.getStorageSync('user_openid');
      if (openid) {
        this.globalData.user_openid = openid;
        return openid;
      }
      return null;
    }
  }
});