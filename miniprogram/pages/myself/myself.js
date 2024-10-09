const app = getApp(); // 获取全局应用实例  
let openid = wx.getStorageSync('user_openid');  
Page({  
  data: {  
    name: '',  
    degree: '',  
    signature: '',  
    college: '',  
    researchAreas: '',  
    avatarUrl: '',  
  },  
  
  onLoad: function() {  
    const openid = wx.getStorageSync('user_openid');  
    if (openid) {  
      this.loadUserData(openid); // 传递 openid 作为参数  
    } else {  
      // 处理没有 openid 的情况，可能需要跳转到登录页面  
      wx.reLaunch({  
        url: '/pages/dengru/newpage'  
      });  
    }  
  },  
  
  loadUserData: function(openid) { // 接收 openid 作为参数  
    const db = wx.cloud.database(); // 确保已经初始化云开发数据库  
    db.collection('users').where({  
      openid: openid  
    }).get({  
      success: res => {  
        if (res.data.length > 0) {  
          const userInfo = res.data[0];  
          this.setData({ // 使用 this.setData 更新页面数据  
            name: userInfo.name,  
            degree: userInfo.degree,  
            signature: userInfo.signature,  
            college: userInfo.college,  
            researchAreas: userInfo.researchAreas,  
            avatarUrl: userInfo.avatarUrl  
          });  
        } else {  
          wx.showToast({  
            title: '数据加载失败，未找到用户信息',  
            icon: 'none'  
          });  
        }  
      },  
      fail: err => {  
        wx.showToast({  
          title: '请求失败，请重试',  
          icon: 'none'  
        });  
        console.error('[数据库查询] [getUserData] 调用失败', err);  
      }  
    });  
  },  
  
  Recruitments: function() {  
    wx.navigateTo({  
      url: '/pages/profile/profile?tabIndex=1'  
    });  
  },  
  
  Comments: function() {  
    wx.navigateTo({  
      url: '/pages/profile/profile?tabIndex=0'  
    });  
  },

  goToEdit: function() {  
    wx.reLaunch({ // 使用 reLaunch 而不是 switchTab
      url: '/pages/editProfile/editProfile'
    })
  },  
  
  logout: function() {  
    wx.showModal({  
      title: '确认退出',  
      content: '您确定要退出登录吗？',  
      success: (res) => {  
        if (res.confirm) {  
          console.log('app:', app); // 打印 app 对象以检查其状态  
          console.log('app.globalData:', app.globalData); // 打印 globalData 以确保其已定义  
          wx.clearStorageSync();
          // 清除本地存储，模拟退出登录  
          if (app.globalData) {
            app.globalData.user_openid = null;
            app.globalData.userInfo = null; // 如果存储了用户信息，也应一并清除
        }
          wx.navigateTo({  
            url: '/pages/dengru/newpage'
          });
        }  
      }  
    });  
  }
});