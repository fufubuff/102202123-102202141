const openid = wx.getStorageSync('openid');  // 从本地存储获取openid
const db = wx.cloud.database();  // 初始化云数据库

Page({
  data: {
    intentProject: '',
    major: '',  // “专业”字段
    skills: '',  // “擅长技能”字段
    contactInfo: '',
    selfIntroduction: ''
  },

  // Update field data on input
  updateField: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  // Update self-introduction from textarea
  updateSelfIntroduction: function(e) {
    this.setData({
      selfIntroduction: e.detail.value
    });
  },
  submitDetails: function() {
    const { intentProject, major, skills, contactInfo, selfIntroduction } = this.data;
    const openid = wx.getStorageSync('openid');
  
    if (!intentProject || !major || !skills || !contactInfo || !selfIntroduction) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
  
    wx.cloud.callFunction({
      name: 'updateResumeDetails',
      data: {
        openid: openid,
        intentProject: intentProject,
        major: major,
        skills: skills,
        contactInfo: contactInfo,
        selfIntroduction: selfIntroduction
      },
      success: function(res) {
        if (res.result.success) {
          wx.showToast({
            title: res.result.message,
            icon: 'success'
          });
          wx.navigateBack();
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        });
        console.error('云函数调用失败：', err);
      }
    });
  }
});
