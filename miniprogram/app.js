App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'fufubuff-3gt0b01y042179cc', // 替换为您的环境ID
      traceUser: true,
    });
  },
  // app.js  

  globalData: {  
    openid: null // 初始化为 null 或其他适当的默认值  
  }  

});

