const openid = wx.getStorageSync('openid');  
const db = wx.cloud.database();  
  
Page({  
  data: {  
    name: '',  
    avatarUrl: '',  
    college: '',  
    major: '',  
    degree: '',  
    researchAreas: '',  
    signature: '',  
    password: ''  
  },  
  
  onLoad: function() {  
    // 页面加载时从数据库加载用户信息  
    this.loadUserInfoFromDatabase();  
  },  
  
  loadUserInfoFromDatabase: function() {  
    db.collection('users').where({  
      openid: openid  
    }).get({  
      success: res => {  
        if (res.data.length > 0) {  
          const userInfo = res.data[0];  
          this.setData({  
            name: userInfo.name || '',  
            avatarUrl: userInfo.avatarUrl || '',  
            college: userInfo.college || '',  
            major: userInfo.major || '',  
            degree: userInfo.degree || '',  
            researchAreas: userInfo.researchAreas || '',  
            signature: userInfo.signature || '',  
            password: userInfo.password || ''  
          });  
        } else {  
          // 如果数据库中没有找到对应的信息，可以选择调用云函数或其他处理方式  
          console.error('No user info found in database.');  
          wx.showToast({  
            title: '未找到用户信息',  
            icon: 'none'  
          });  
        }  
      },  
      fail: err => {  
        console.error('Failed to fetch user info from database', err);  
        wx.showToast({  
          title: '加载用户信息失败，请重试',  
          icon: 'none'  
        });  
      }  
    });  
  },  
  
  chooseAvatar: function() {  
    wx.navigateTo({  
      url: '/pages/avatarSelect/avatarSelect',  
    });  
  },  
  
  onShow: function() {  
    const newAvatar = wx.getStorageSync('selectedAvatar');  
    if (newAvatar) {  
      this.setData({  
        avatarUrl: newAvatar  
      });  
    }  
  },  
  
  onInputChange: function(e) {  
    const field = e.currentTarget.dataset.field;  
    this.setData({  
      [field]: e.detail.value  
    });  
  },  
  
  submitEdit: function() {  
    const { name, avatarUrl, college, major, degree, researchAreas, signature, password } = this.data; 
    
    if (!name || !college || !major || !degree || !researchAreas || !password || !avatarUrl) {  
      wx.showToast({  
        title: '请完整填写所有必填项',  
        icon: 'none'  
      });  
      return;  
    }  
  
    db.collection('users').where({  
      openid: openid  
    }).update({  
      data: {  
        name,  
        avatarUrl,  
        college,  
        major,  
        degree,  
        researchAreas,  
        signature,  
        password  
      },  
      success: res => {  
        wx.showToast({  
          title: '保存成功',  
          icon: 'success'  
        });  
        wx.navigateBack();  
      },  
      fail: err => {  
        console.error('保存失败', err);  
        wx.showToast({  
          title: '保存失败，请重试',  
          icon: 'none'  
        });  
      }  
    });  
  }  
});