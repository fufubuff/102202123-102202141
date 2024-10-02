Page({
  data: {
    tabIndex: 0, // 当前选中的标签索引
    resumes: [], // 简历数据
    recruitmentPosts: [], // 招募数据
  },

  onLoad: function () {
    // 初始化数据
    this.fetchResumesData();
    this.fetchRecruitmentPostsData();
  },

  // 切换标签页
  switchTab: function (e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ tabIndex: index });
  },

  // 获取简历数据
  fetchResumesData: function () {
    const db = wx.cloud.database();
    db.collection('resumes')
      .get()
      .then((res) => {
        console.log('Resumes data:', res.data);
        this.setData({
          resumes: res.data,
        });
      })
      .catch((err) => {
        console.error('获取简历数据失败：', err);
      });
  },
  
  fetchRecruitmentPostsData: function () {
    const db = wx.cloud.database();
    db.collection('recruitmentPosts')
      .get()
      .then((res) => {
        console.log('Recruitment posts data:', res.data);
        this.setData({
          recruitmentPosts: res.data,
        });
      })
      .catch((err) => {
        console.error('获取招募数据失败：', err);
      });
  },
});