// home.js
Page({
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    });
  },

  agreePrivacyPolicy: function() {
    wx.setStorageSync('hasAgreedPrivacyPolicy', true);
    wx.redirectTo({
      url: '/pages/dengru/newpage' // 主功能页面
    });
  },

  disagreePrivacyPolicy: function() {
    wx.showModal({
      title: '需要同意隐私政策',
      content: '您需要同意我们的隐私政策才能使用本程序',
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          wx.exitMiniProgram(); // 用户不同意则退出小程序
        }
      }
    });
  }
});
