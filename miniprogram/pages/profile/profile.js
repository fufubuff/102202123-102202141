const app = getApp(); 
const db = wx.cloud.database();

Page({
  data: {
    username: '', // 初始为空，加载后设置为用户昵称
    slogan: '探索世界，发现美好',
    avatarUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg', // 默认头像路径
    backgroundUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/wsp_background.png', // 更换为实际图片路径
    tabIndex: 0, // 当前选中的标签索引
    cooperationReviews: [], // 个人合作评价数据
    teamRecruitments: [], // 组队招募信息
    tabs: ['合作评价', '组队招募'], // 标签名称
    defaultAvatars: [
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar1.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar2.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar3.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar4.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar5.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar6.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar7.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar8.jpg',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar9.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar10.png',
    ],
    showAvatarSelector: false, // 控制头像选择器显示
    selectedAvatar: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar1.png', // 当前选中的头像
  },
  onLoad: function () {
    this.loadUserInfo(); // 先加载用户信息
  },
  changeAvatar: function () {
    this.setData({
      showAvatarSelector: true
    });
  },

  // 选择新头像
  changeAvatar: function () {
    wx.navigateTo({
      url: `/pages/avatarSelect/avatarSelect?currentAvatar=${this.data.avatarUrl}`
    });
  },


  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const that = this;
    this.getUserOpenId().then(openid => {
      console.log('当前用户的 openid:', openid);
      const usersCollection = db.collection('users');
      
      usersCollection.doc(openid).get()
        .then(res => {
          if (res.data && Object.keys(res.data).length !== 0) {
            console.log('获取到的用户信息:', res.data);
            that.setData({
              username: res.data.nickname,
              avatarUrl: res.data.avatarUrl || '/images/default-avatar.png',
              openid : res.data.openid,
            });
            // 在成功获取用户信息后，加载组队招募数据
            that.fetchCooperationReviewsData();
            that.fetchTeamRecruitmentsData(openid);
          } else {
            console.log('用户信息不存在，可能需要注册');
            wx.showToast({
              title: '用户信息不存在，请先注册',
              icon: 'none'
            });
            // 跳转到注册页面
            wx.navigateTo({
              url: '/pages/register/register'
            });
          }
        })
        .catch(err => {
          console.error('获取用户信息失败:', err);
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        });
    }).catch(err => {
      console.error('获取 openid 失败:', err);
      wx.showToast({
        title: '获取 openid 失败',
        icon: 'none'
      });
    });
  },

  /**
   * 获取当前用户的 openid
   */
  getUserOpenId: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          const openid = res.result.openid;
          console.log('获取到的 openid:', openid);
          resolve(openid);
        },
        fail: err => {
          console.error('获取 openid 失败:', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 切换标签
   */
  switchTab: function (e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ tabIndex: index });
  },

  /**
   * 获取合作评价数据
   */
  fetchCooperationReviewsData: function () {
    const that = this;
    db.collection('cooperationReviews').get()
      .then(res => {
        that.setData({
          cooperationReviews: res.data
        });
      })
      .catch(err => {
        console.error('获取合作评价数据失败:', err);
        wx.showToast({
          title: '获取合作评价失败',
          icon: 'none'
        });
      });
  },

  /**
   * 获取与当前用户关联的组队招募数据
   */
  fetchTeamRecruitmentsData: function (userId) {
    const that = this;
    db.collection('teamRecruitments').where({
      userId: userId
    }).get()
      .then(res => {
        that.setData({
          teamRecruitments: res.data
        });
      })
      .catch(err => {
        console.error('获取组队招募数据失败:', err);
        wx.showToast({
          title: '获取组队招募失败',
          icon: 'none'
        });
      });
  },
  viewDetails: function(e) {
    const recruitmentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recruitmentDetail/recruitmentDetail?id=${recruitmentId}`
    });
  },

  /**
   * 私信按钮点击事件处理
   */
  openChat: function() {
    // 获取当前页面用户的 openid 或 id
    const targetUserId = this.data.openid; // 或者替换为当前页面用户的 ID
    console.error('openid', targetUserId);
    wx.navigateTo({
      url: `/pages/chat/chat?chatUserId=${targetUserId}`
    });
  },

});
