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
      'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/avatars/avatar12.png',
    ],
    selectedAvatar: '' // 用户选择的新头像
  },

  onLoad: function (options) {
    // 获取当前头像并设置
    this.setData({
      currentAvatar: options.currentAvatar || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg', // 传递过来的当前头像
      selectedAvatar: options.currentAvatar || 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg' // 默认选中当前头像
    });
  },

  // 选择新头像
  selectAvatar: function (e) {
    const selectedUrl = e.currentTarget.dataset.url;
    this.setData({
      selectedAvatar: selectedUrl
    });
  },

  // 确认选择，更新当前头像并返回上一页
  confirmSelection: function () {
    const selectedAvatar = this.data.selectedAvatar;
    const pages = getCurrentPages(); // 获取页面栈
    const prevPage = pages[pages.length - 2]; // 上一个页面

    // 更新上一页的头像
    prevPage.setData({
      avatarUrl: selectedAvatar
    });

    // 调用云函数获取 openid，并更新数据库中的头像信息
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        const openid = res.result.openid;
        const usersCollection = wx.cloud.database().collection('users');
        
        // 更新数据库中的头像URL
        usersCollection.doc(openid).update({
          data: {
            avatarUrl: selectedAvatar
          }
        }).then(() => {
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
          // 返回上一页
          wx.navigateBack();
        }).catch(err => {
          console.error('头像更新失败:', err);
          wx.showToast({
            title: '头像更新失败',
            icon: 'none'
          });
        });
      },
      fail: err => {
        console.error('获取 openid 失败:', err);
        wx.showToast({
          title: '获取 openid 失败',
          icon: 'none'
        });
      }
    });
  }
});
