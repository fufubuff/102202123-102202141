// 获取全局应用实例和数据库实例
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    nickname: '',
    password: '',
    isLoading: false // 控制加载指示器的显示
  },
  
  // 页面加载时的操作
  onLoad: function(options) {
    wx.hideTabBar(); // 隐藏底部 tabBar
    this.checkLoginStatus(); // 检查登录状态，如果已登录，则自动跳转
  },

  // 页面卸载时的操作
  onUnload: function() {
    wx.showTabBar(); // 当页面卸载时显示 tabBar
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const openid = wx.getStorageSync('user_openid'); // 从本地存储获取 openid
    if (openid) {
      // 如果已经有 openid，自动跳转到主页面
      wx.switchTab({
        url: '/pages/myself/myself'
      });
    }
  },

  // 输入框内容变化时更新数据
  inputChange: function(e) {
    const field = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData({
      [field]: value
    });
  },

  // 登录按钮点击事件处理
  handleLoginTap: function() {
    this.formSubmit(); // 提交表单
  },

  // 处理表单提交逻辑
  formSubmit: function() {
    const { nickname, password } = this.data;
    if (!nickname.trim() || !password.trim()) {
      // 如果学工号或密码为空，则显示提示
      wx.showToast({
        title: '学工号或密码不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({ isLoading: true }); // 开始加载

    // 调用云函数进行登录
    wx.cloud.callFunction({
      name: 'login',
      data: { nickname: nickname, password: password },
      success: res => {
        if (res.result && res.result.openid) {
          // 登录成功后的处理
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000,
          });

          // 更新全局变量和本地存储
          app.setUserOpenid(res.result.openid);
          wx.setStorageSync('user_openid', res.result.openid);

          // 查询用户信息并跳转到主页面
          db.collection('users').where({ openid: res.result.openid }).get({
            success: userRes => {
              if (userRes.data.length > 0) {
                const userInfo = userRes.data[0];
                app.globalData.userInfo = userInfo;
                wx.setStorageSync('userInfo', userInfo);
                wx.reLaunch({ // 使用 reLaunch 而不是 switchTab
                  url: '/pages/myself/myself'
                });
              } else {
                wx.showToast({
                  title: '未找到用户信息',
                  icon: 'none',
                  duration: 2000
                });
                this.setData({ isLoading: false }); // 取消加载状态
              }
            },
            fail: err => {
              console.error('查询用户信息失败', err);
              wx.showToast({
                title: '查询用户信息失败，请重试',
                icon: 'none',
                duration: 2000
              });
              this.setData({ isLoading: false }); // 取消加载状态
            }
          });
        } else {
          wx.showToast({
            title: '登录失败，请检查账号或密码',
            icon: 'none',
            duration: 2000
          });
          this.setData({ isLoading: false }); // 取消加载状态
        }
      },
      fail: err => {
        console.error('调用云函数失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
        this.setData({ isLoading: false }); // 取消加载状态
      }
    });
  }
});
