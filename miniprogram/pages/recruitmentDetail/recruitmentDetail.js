const db = wx.cloud.database();

Page({
  data: {
    recruitment: {
      title: '',
      details: '',
      tags: [],
      time: '',
      nickname: '',
      avatarUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'
    },
    recruitmentId: '',
    isLoading: true // 添加加载状态
  },

  onLoad: function(options) {
    const recruitmentId = options.id;
    this.setData({ recruitmentId });
    this.fetchRecruitmentDetail(recruitmentId);
  },

  /**
   * 获取招募详情信息
   */
  fetchRecruitmentDetail: function(id) {
    const that = this;
    db.collection('teamRecruitments').doc(id).get()
      .then(res => {
        if (res.data && Object.keys(res.data).length !== 0) {
          const recruitment = res.data;
          // 格式化时间
          const formattedTime = new Date(recruitment.time).toLocaleString();
          // 获取发布者的用户信息
          db.collection('users').doc(recruitment.userId).get()
            .then(userRes => {
              const user = userRes.data;
              that.setData({
                recruitment: {
                  ...recruitment,
                  time: formattedTime,
                  nickname: user.nickname || '未知',
                  avatarUrl: user.avatarUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'
                },
                isLoading: false
              });
            })
            .catch(err => {
              console.error('获取发布者信息失败:', err);
              that.setData({
                recruitment: {
                  ...recruitment,
                  time: formattedTime,
                  nickname: '未知',
                  avatarUrl: '/images/default-avatar.png'
                },
                isLoading: false
              });
            });
        } else {
          wx.showToast({
            title: '招募信息不存在',
            icon: 'none'
          });
          that.setData({ isLoading: false });
          wx.navigateBack();
        }
      })
      .catch(err => {
        console.error('获取招募详情失败:', err);
        wx.showToast({
          title: '获取招募详情失败',
          icon: 'none'
        });
        that.setData({ isLoading: false });
      });
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
