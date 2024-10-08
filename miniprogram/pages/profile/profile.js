const app = getApp(); 
const db = wx.cloud.database();

Page({
  data: {
    name: '', // 初始为空，加载后设置为用户昵称
    signature: '',
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
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar11.png',
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar12.png'
  ],
    showAvatarSelector: false, // 控制头像选择器显示
    selectedAvatar: 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'
    // 当前选中的头像
  },
  onLoad: function (options) {  
    const type = options.type || ''; // 获取传递的类型参数，默认为空字符串  
    this.loadUserInfo(); // 先加载用户信息  
  
    // 根据类型加载不同的数据  
    if (type === 'recruitments') {  
      this.fetchTeamRecruitmentsData(wx.getStorageSync('openid')); // 假设这里已经获取了openid  
    } else if (type === 'comments') {  
      this.fetchCooperationReviewsData();  
    }  
  },  
  // 选择新头像（只保留一个 changeAvatar 方法）  
  changeAvatar: function () {  
    // 如果您想要在选择头像后返回并更新当前页面的头像，可以使用 navigateTo 并传递当前头像 URL  
    // 这里假设您有一个专门的页面来选择头像  
    wx.navigateTo({  
      url: `/pages/avatarSelect/avatarSelect?currentAvatar=${this.data.avatarUrl}`  
    });  
  },  
  /**
   * 加载用户信息
   */
  loadUserInfo: function() {  
    const that = this;  
    const openid = wx.getStorageSync('openid'); // 从本地存储中获取 openid  
  
    if (!openid) {  
      console.error('未找到 openid，请确保用户已登录');  
      wx.showToast({  
        title: '用户未登录，请先登录',  
        icon: 'none'  
      });  
      // 跳转到登录页面  
      wx.navigateTo({  
        url: '/pages/dengru/newpage' // 修改为您的登录页面路径  
      });  
      return;  
    }  
  
    console.log('当前用户的 openid:', openid);  
    const usersCollection = db.collection('users');  
  
    usersCollection.doc(openid).get()  
      .then(res => {  
        if (res.data && Object.keys(res.data).length !== 0) {  
          console.log('获取到的用户信息:', res.data);  
          that.setData({  
            name: res.data.name,  
            avatarUrl: res.data.avatarUrl || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg',  
            // 注意：这里不需要再设置 openid，因为它已经从本地存储中获取了  
          });  
          // 加载其他数据  
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
  db.collection('recruitmentPosts').get()  
    .then(res => {  
      if (res.data.length === 0) {  
        that.setData({  
          noReviews: true, // 没有评价数据时显示提示  
        });  
      } else {  
        that.setData({  
          recruitmentPosts: res.data,  
          noReviews: false, // 有评价数据时不显示提示  
          tabIndex: 0 // 可以根据需要设置默认显示的标签  
        });  
      }  
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
fetchTeamRecruitmentsData: function (openid) {  
  const that = this;  
  db.collection('teamRecruitments').where({  
    openid: openid, // 根据您的数据库结构调整查询条件  
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
          tabIndex: 1 // 可以根据需要设置默认显示的标签（这里设为1是为了示例，实际可能需要根据逻辑调整）  
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
