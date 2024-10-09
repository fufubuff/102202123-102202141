const db = wx.cloud.database();
Page({
  data: {
    intentProject: '', // 意向项目
    major: '', // 专业
    skills: '', // 擅长技能
    contactInfo: '', // 联系方式
    selfIntroduction: '' // 自我介绍
  },

  onLoad: function (options) {
    // 获取传递的简历的 ID
    const detailId = options.id;

    if (!detailId) {
      wx.showToast({
        title: '无法加载推荐信息',
        icon: 'none'
      });
      return;
    }

    // 从数据库中获取简历详情
    this.loadRecommendationDetail(detailId);
  },

  loadRecommendationDetail: function (detailId) {
    const that = this;

    // 假设数据库集合名称为 'resumes'
    db.collection('resumes').doc(detailId).get()
      .then(res => {
        if (res.data) {
          const { intentProject, major, skills, contactInfo, selfIntroduction } = res.data;

          // 设置页面数据
          that.setData({
            intentProject: intentProject || '未提供',
            major: major || '未提供',
            skills: skills || '未提供',
            contactInfo: contactInfo || '未提供',
            selfIntroduction: selfIntroduction || '未提供'
          });
        } else {
          wx.showToast({
            title: '未找到信息',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载自我推荐信息失败:', err);
        wx.showToast({
          title: '加载自我推荐信息失败',
          icon: 'none'
        });
      });
  }
});