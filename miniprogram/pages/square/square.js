Page({
  data: {
    tabIndex: 0, // 当前选中的标签索引
    resumes: [], // 简历数据
    recruitmentPosts: [], // 招募数据
    openid: '', // 用户的 openid
  },

  onLoad: function (options) {
    const openid = wx.getStorageSync('user_openid');
    console.log('获取到的 openid:', openid);
    if (openid) {
      this.setData({
        openid: openid
      });
    }
    // 并行获取简历和招募数据
    this.fetchResumesData();
    this.fetchRecruitmentPostsData();
  },

  // 使用 async/await 和 Promise.all 来并行处理获取头像的任务
  fetchResumesData: async function () {
    const db = wx.cloud.database();
    
    try {
      const resumeResponse = await db.collection('resumes').get();
      const resumes = resumeResponse.data;
      const fetchAvatarPromises = resumes.map(async (resume) => {
        try {
          const userRes = await db.collection('users').where({
            openid: resume.openid
          }).get();
          if (userRes.data.length > 0) {
            resume.avatarUrl = userRes.data[0].avatarUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatar.png'; // 如果没有头像，使用默认头像
          }
        } catch (err) {
          console.error('匹配用户头像失败：', err);
          resume.avatarUrl = 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatar.png'; // 失败时使用默认头像
        }
        return resume;
      });
      
      const updatedResumes = await Promise.all(fetchAvatarPromises);
      this.setData({
        resumes: updatedResumes // 更新简历数据
      });
    } catch (err) {
      console.error('获取简历数据失败：', err);
    }
  },

  // 获取招募信息
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

  goToDetailPage: function (e) {
    const resumeId = e.currentTarget.dataset.id;
    if (resumeId) {
      wx.navigateTo({
        url: `/pages/recruitmentDetail/recruitmentDetail?id=${resumeId}`
      });
    }
  },
  goToUserProfile: function(e) {
    const openid = e.currentTarget.dataset.openid;  // 从点击事件获取 openid
    if (openid) {
      // 导航到用户个人资料页面逻辑
      wx.navigateTo({
        url: `/pages/profile/profile?userOpenid=${openid}`
      });
      console.log('Navigating to user profile with OpenID:', openid);
    } else {
      console.log('OpenID not found for user profile navigation');
    }
  },
  goToFindTeamDetail: function(e) {
    const postId = e.currentTarget.dataset.id;  // Get the recruitment post ID from data-id attribute
    if (postId) {
      wx.navigateTo({
        url: `/pages/find_team_detail/find_team_detail?id=${postId}`
      });
    }
  },

  switchTab: function (e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ tabIndex: index });
  },

  onSwiperChange: function (e) {
    this.setData({ tabIndex: e.detail.current });
  },
});
