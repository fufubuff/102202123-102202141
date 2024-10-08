Page({      
  data: {      
    nickname: '',      
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
    this.setData({      
        [field]: value      
    });      
  },      
      
  // 处理登录按钮点击事件      
  handleLoginTap: function() {      
    this.formSubmit();      
  },      
      
  formSubmit: function() {  
    const { nickname, password } = this.data;  
    if (!nickname.trim() || !password.trim()) {  
      wx.showToast({  
        title: '学工号或密码不能为空',  
        icon: 'none',  
        duration: 2000  
      });  
      return;  
    }  
    
    wx.cloud.callFunction({  
      name: 'login',  
      data: {  
        nickname: nickname,  
        password: password  
      },  
      success: res => {  
        console.log('登录结果', res.result);  
        if (res.result && res.result.openid) {  
          wx.showToast({  
            title: '登录成功',  
            icon: 'success',  
            duration: 2000  
          });  
    
          // 存储用户ID到本地  
          wx.setStorageSync('openid', res.result.openid);  
          wx.switchTab({  
            url: '/pages/square/square'  
          });  
    
        } else if (res.result && res.result.error) {  
          wx.showToast({  
            title: res.result.error,  
            icon: 'none',  
            duration: 2000  
          });  
        } else {  
          wx.showToast({  
            title: '登录失败，未知错误',  
            icon: 'none',  
            duration: 2000  
          });  
        }  
      },  
      fail: err => {  
        console.error('调用云函数失败', err);  
        wx.showToast({  
          title: '登录失败，请重试',  
          icon: 'none',  
          duration: 2000  
        });  
      }  
    });  
  }
});