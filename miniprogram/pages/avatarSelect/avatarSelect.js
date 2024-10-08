Page({
  data: {
    currentAvatar: '', // 当前头像
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
    selectedAvatar: '', // 用户选择的新头像
    openid: '' // 新增openid存储  
  },
  onLoad: function (options) {  
    const openid = wx.getStorageSync('openid');  
    this.setData({  
      openid: openid, // 设置openid  
      currentAvatar: options.currentAvatar || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg',  
      selectedAvatar: options.currentAvatar || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'  
    });  
  },  
  
  selectAvatar: function (e) {  
    const selectedUrl = e.currentTarget.dataset.url;  
    this.setData({  
      selectedAvatar: selectedUrl  
    });  
  },  
  
  confirmSelection: function () {  
    const { selectedAvatar, openid } = this.data;  
    const pages = getCurrentPages();  
    const prevPage = pages[pages.length - 2];  
  
    if (!openid) {  
      wx.cloud.callFunction({  
        name: 'login',  
        success: res => {  
          const retrievedOpenid = res.result.openid;  
          if (!retrievedOpenid) {  
            wx.showToast({  
              title: '获取 openid 失败',  
              icon: 'none'  
            });  
            return;  
          }  
          this.updateAvatar(retrievedOpenid, selectedAvatar, prevPage);  
        },  
        fail: err => {  
          console.error('获取 openid 失败:', err);  
          wx.showToast({  
            title: '获取 openid 失败',  
            icon: 'none'  
          });  
        }  
      });  
    } else {  
      this.updateAvatar(openid, selectedAvatar, prevPage);  
    }  
  },  
  
  updateAvatar: function(openid, selectedAvatar, prevPage) {  
    const usersCollection = wx.cloud.database().collection('users');  
    usersCollection.doc(openid).update({  
      data: {  
        avatarUrl: selectedAvatar  
      }  
    }).then(() => {  
      wx.showToast({  
        title: '头像更新成功',  
        icon: 'success'  
      });  
      prevPage.setData({  
        avatarUrl: selectedAvatar  
      });  
      wx.navigateBack();  
    }).catch(err => {  
      console.error('头像更新失败:', err);  
      wx.showToast({  
        title: '头像更新失败',  
        icon: 'none'  
      });  
    });  
  },  
  handleAvatarSelected: function(avatarPath) {  
    wx.setStorageSync('selectedAvatar', avatarPath);  
    wx.navigateBack();  
  }
});
