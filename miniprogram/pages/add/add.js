// pages/square/square.js
Page({
  data: {
    tabIndex: 0,
    resumes: [
      { name: 'Eric', email: 'eric@example.com', time: '14:00' },
      { name: 'gukn', email: 'gukn@example.com', time: '14:00' },
      { name: '张教授', email: 'profzhang@example.com', time: '9月10日 5:20' }
    ]
  },

  switchTab: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      tabIndex: index
    });
  },

  goHome: function() {
    wx.navigateTo({ url: '/pages/square/square' });
  },

  goAdd: function() {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goProfile: function() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  }
});