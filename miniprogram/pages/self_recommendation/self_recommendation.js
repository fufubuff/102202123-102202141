const openid = wx.getStorageSync('user_openid');  // 从本地存储获取openid
const db = wx.cloud.database();  // 初始化云数据库
Page({
  data: {
    intentProject: '',
    major: '',
    skills: '',
    contactInfo: '',
    selfIntroduction: '',
    name: '',  // 新增字段
    email: '',  // 新增字段
  },
  onLoad: function() {
    this.getNameByOpenid();
  },

  getNameByOpenid: function() {
    const openid = wx.getStorageSync('user_openid');  // 获取当前用户的openid

    if (!openid) {
      wx.showToast({
        title: '无法获取openid',
        icon: 'none'
      });
      return;
    }

    db.collection('users')  // 修改集合名称为 'users'
      .where({
        openid: openid  // 通过openid查找相应的数据
      })
      .get({
        success: res => {
          if (res.data.length > 0) {
            this.setData({
              name: res.data[0].name  // 取出name字段的值
            });
            wx.showToast({
              title: `欢迎 ${res.data[0].name}`,
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '未找到用户信息',
              icon: 'none'
            });
          }
        },
        fail: err => {
          wx.showToast({
            title: '查询失败',
            icon: 'none'
          });
          console.error('查询用户信息失败：', err);
        }
      });
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
    const { intentProject, major, skills, contactInfo, selfIntroduction, name, email } = this.data;
    const openid = wx.getStorageSync('user_openid');

    if (!intentProject || !major || !skills || !contactInfo || !selfIntroduction) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const db = wx.cloud.database();
    db.collection('resumes').add({
      data: {
        _id: db.serverDate(),  // 使用服务器生成的唯一ID
        email: contactInfo,
        name: name,
        openid: openid,
        time: new Date().toLocaleString(),
        intentProject: intentProject,
        major: major,
        skills: skills,
        selfIntroduction: selfIntroduction,
        contactInfo: contactInfo,
      },
      success: function(res) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        wx.navigateBack();
      },
      fail: function(err) {
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        });
        console.error('发布自我招聘失败：', err);
      }
    });
  }
});
