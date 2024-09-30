// pages/login/login.js
Page({
  data: {
    username: '',
    password: ''
  },
  onLoad: function(options) {
    wx.hideTabBar();  // 隐藏底部 tabBar
  },

  onUnload: function() {
    wx.showTabBar();  // 当页面卸载时显示 tabBar
  },
  // 当输入框内容变化时更新data中的值
  inputChange: function(e) {
    const field = e.currentTarget.dataset.key;
    const value = e.detail.value;
    console.log(`Updated ${field}: ${value}`);  // 将打印出被更新的字段和值
    this.setData({
        [field]: value
    });
},

  // 处理登录按钮点击事件
  handleLoginTap: function() {
    this.formSubmit();
  },

  // 提交表单
  formSubmit: function() {
    const { username, password } = this.data;
    console.log(`Logging in with username: ${username} and password: ${password}`);
    // 检查输入
    if (!username.trim() || !password.trim()) {
      wx.showToast({
        title: '学工号或密码不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 校验密码
    if (password === '888888') {
      console.log('登录成功');
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 假设登录成功后跳转到广场页面
          wx.redirectTo({
            url: '/pages/square/square'
          });
        }
      });
    } else {
      wx.showToast({
        title: '密码错误，请输入六个8',
        icon: 'none',
        duration: 2000
      });
    }
  }
});




