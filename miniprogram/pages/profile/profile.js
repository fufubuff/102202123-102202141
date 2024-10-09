// profile.js

const app = getApp();  
const db = wx.cloud.database();

Page({
  data: {
    name: '', // 用户昵称
    signature: '',
    avatarUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg', // 默认头像路径
    backgroundUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/wsp_background.png', // 背景图片路径
    tabIndex: 0, // 当前选中的标签索引
    cooperationReviews: [], // 个人合作评价数据
    teamRecruitments: [], // 组队招募信息
    tabs: ['合作评价', '组队招募'], // 标签名称
    defaultAvatars: [
      'cloud://your-cloud-path/images/avatars/avatar1.png',
      // ...其他头像路径
      'cloud://your-cloud-path/images/avatars/avatar12.png'
    ],
    showAvatarSelector: false, // 控制头像选择器显示
    selectedAvatar: 'cloud://your-cloud-path/images/default-avatar.jpg', // 当前选中的头像
    noReviews: false, // 是否没有合作评价
    noRecruitments: false, // 是否没有组队招募
    userOpenid: '' // 存储并显示用户的 openid
  },

  onLoad: function (options) {
    const type = options.type || ''; // 获取传递的类型参数，默认为空字符串
    const userOpenid = options.userOpenid || wx.getStorageSync('user_openid'); // 优先使用传递的 userOpenid，若不存在则使用本地存储
    if (options.tabIndex) {
      this.setData({
        tabIndex: parseInt(options.tabIndex) // 获取传递过来的 tabIndex 参数
      });
    }
    if (userOpenid) {
      this.setData({
        userOpenid: userOpenid // 设置 userOpenid 到页面数据中
      });
      this.loadUserInfo(userOpenid).then(() => {
        // 在用户信息加载完后再加载其他数据
        if (type === 'recruitments') {
          this.fetchTeamRecruitmentsData(userOpenid); // 加载组队招募信息
        } else if (type === 'comments') {
          this.fetchCooperationReviewsData(); // 加载合作评价
        } else {
          // 默认加载当前 tabIndex 对应的数据
          if (this.data.tabIndex === 1) {
            this.fetchTeamRecruitmentsData(userOpenid);
          } else if (this.data.tabIndex === 0) {
            this.fetchCooperationReviewsData();
          }
        }
      }).catch(err => {
        console.error('加载用户信息失败:', err);
        wx.showToast({
          title: '加载用户信息失败',
          icon: 'none'
        });
      });
    } else {
      console.error('未找到 userOpenid，请确保用户已登录');
      wx.showToast({
        title: '用户未登录，请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/dengru/newpage' // 跳转到登录页面
      });
    }
  },

  // 选择新头像
  changeAvatar: function () {
    // 跳转到头像选择页面，并传递当前头像 URL
    wx.navigateTo({
      url: `/pages/avatarSelect/avatarSelect?currentAvatar=${this.data.avatarUrl}`
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function (userOpenid) {
    const that = this;

    if (!userOpenid) {
      return Promise.reject('未找到 userOpenid，请确保用户已登录');
    }

    console.log('当前用户的 userOpenid:', userOpenid);
    const usersCollection = db.collection('users');

    // 假设 'openid' 是用户文档的 _id，如果不是，请使用 where 查询
    return usersCollection.doc(userOpenid).get()
      .then(res => {
        if (res.data && Object.keys(res.data).length !== 0) {
          console.log('获取到的用户信息:', res.data);
          that.setData({
            name: res.data.name || '',
            signature: res.data.signature || '',
            avatarUrl: res.data.avatarUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg',
            backgroundUrl: res.data.backgroundUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/wsp_background.png'
          });
        } else {
          console.log('用户信息不存在，可能需要注册');
          wx.showToast({
            title: '用户信息不存在，请先注册',
            icon: 'none'
          });
          wx.navigateTo({
            url: '/pages/register/register' // 跳转到注册页面
          });
          return Promise.reject('用户信息不存在');
        }
      })
      .catch(err => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
        return Promise.reject(err);
      });
  },

  switchTab: function(e) {
    const tabIndex = parseInt(e.currentTarget.dataset.index, 10); // 将字符串转换为数字
    this.setData({
      tabIndex: tabIndex
    });
    // 根据选中的标签索引加载相应的数据
    if (tabIndex === 1) {
      this.fetchTeamRecruitmentsData(this.data.userOpenid);
    } else if (tabIndex === 0) {
      this.fetchCooperationReviewsData();
    }
  },

  /**  
   * 获取合作评价数据  
   */  
  fetchCooperationReviewsData: function () {  
    const that = this;  
    that.setData({ isLoading: true }); // 开始加载
    db.collection('cooperationReviews')
      .where({
        targetOpenid: this.data.userOpenid
      })
      .get()
      .then(res => {
        if (res.data.length === 0) {  
          that.setData({  
            noReviews: true, // 没有评价数据时显示提示  
            cooperationReviews: [] // 清空现有评价
          });  
        } else {  
          // 需要手动关联获取评价者的信息
          const reviewerOpenids = res.data.map(item => item.reviewerOpenid);
          db.collection('users').where({
            _id: db.command.in(reviewerOpenids)
          }).get().then(userRes => {
            const usersMap = {};
            userRes.data.forEach(user => {
              usersMap[user._id] = user;
            });
            const cooperationReviews = res.data.map(item => ({
              ...item,
              reviewerName: usersMap[item.reviewerOpenid]?.name || '匿名',
              reviewerAvatarUrl: usersMap[item.reviewerOpenid]?.avatarUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'
            }));
            that.setData({  
              cooperationReviews, // 更新合作评价数据  
              noReviews: false, // 有评价数据时不显示提示  
            });  
            that.setData({ isLoading: false }); // 结束加载
          }).catch(err => {
            console.error('获取评价者信息失败:', err);
            wx.showToast({  
              title: '获取评价者信息失败',  
              icon: 'none'
            });  
            that.setData({ isLoading: false }); // 结束加载
          });
        }  
      })  
      .catch(err => {  
        console.error('获取合作评价数据失败:', err);  
        wx.showToast({  
          title: '获取合作评价失败',  
          icon: 'none'
        });  
        that.setData({ isLoading: false }); // 结束加载
      });  
  },

  /**  
   * 获取与当前用户关联的组队招募数据  
   */  
  fetchTeamRecruitmentsData: function (userOpenid) {  
    const that = this;  
    db.collection('recruitmentPosts').where({  
      openid: userOpenid, // 根据您的数据库结构调整查询条件  
    }).get()  
      .then(res => {  
        if (res.data.length === 0) {  
          that.setData({  
            noRecruitments: true, // 没有招募数据时显示提示  
          });  
        } else {  
          that.setData({  
            teamRecruitments: res.data,  
            noRecruitments: false, // 有招募数据时不显示提示  
          });  
        }  
      })  
      .catch(err => {  
        console.error('获取组队招募数据失败:', err);  
        wx.showToast({  
          title: '获取组队招募失败',  
          icon: 'none'  
        });  
      });  
  },

  /**
   * 查看详情
   */
  viewDetails: function(e) {
    const recruitmentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/find_team_detail/find_team_detail?id=${recruitmentId}`
    });
  },
  openEvaluation: function() {
    const targetOpenid = this.data.userOpenid; // 目标用户的 openid

    if (!targetOpenid) {
      wx.showToast({
        title: '无法获取目标用户信息',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/evaluation/evaluation?targetOpenid=${targetOpenid}` // 传递目标用户的 openid
    });
  },
  /**
   * 私信按钮点击事件处理
   */
  openChat: function() {
    const userOpenid = this.data.userOpenid;  // 从页面的数据中获取当前用户的 openid
  
    if (!userOpenid) {
      wx.showToast({
        title: '用户未登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/dengru/newpage' // 登录页面路径
      });
      return;
    }
  
    console.log('userOpenid for chat:', userOpenid);
    wx.navigateTo({
      url: `/pages/chat/chat?chatUserId=${userOpenid}` // 跳转到聊天页面并传递 userOpenid
    });
  },

  /**
   * 头像选择器返回后更新头像
   */
  onShow: function() {
    const selectedAvatar = wx.getStorageSync('selectedAvatar');
    if (selectedAvatar) {
      this.setData({
        avatarUrl: selectedAvatar
      });
      // 清除选择的头像缓存
      wx.removeStorageSync('selectedAvatar');
      // 更新数据库中的 avatarUrl
      db.collection('users').doc(this.data.userOpenid).update({
        data: {
          avatarUrl: selectedAvatar
        }
      }).then(() => {
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }).catch(err => {
        console.error('头像更新失败:', err);
        wx.showToast({
          title: '头像更新失败',
          icon: 'none'
        });
      });
    }
  },

  /**
   * 退出登录
   */
  logout: function() {  
    wx.showModal({  
      title: '确认退出',  
      content: '您确定要退出登录吗？',  
      success: (res) => {  
        if (res.confirm) {  
          console.log('app:', app); // 打印 app 对象以检查其状态  
          console.log('app.globalData:', app.globalData); // 打印 globalData 以确保其已定义  
          
          // 清除本地存储中的 'user_openid' 和 'userInfo'
          wx.removeStorageSync('user_openid'); 
          wx.removeStorageSync('userInfo');
          
          // 清除全局变量中的 userOpenid
          if (app.globalData && app.globalData.userOpenid !== undefined) {
            app.globalData.userOpenid = null; 
          }

          // 清空当前页面的用户信息
          this.setData({ 
            name: '',
            signature: '',
            avatarUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg',
            backgroundUrl: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg',
            noReviews: false,
            noRecruitments: false,
            cooperationReviews: [],
            teamRecruitments: []
          });
          
          // 重新跳转到登录页面  
          wx.reLaunch({  
            url: '/pages/dengru/newpage' // 登录页面路径  
          });  
        }  
      }  
    });  
  }
});
