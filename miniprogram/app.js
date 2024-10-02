App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'fufubuff-3gt0b01y042179cc', // 替换为您的环境ID
      traceUser: true,
    });
  },
});

