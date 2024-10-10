Page({
  data: {
    nickname: '',
    password: '',
    confirmPassword: '',
    avatarUrl: '/images/avatars/avatar1.png', // 默认选择第一个头像
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
    selectedAvatar: '/images/avatars/avatar1.png' // 当前选中的头像
  },

  /**
   * 昵称输入处理
   */
  onNicknameInput: function(e) {
    console.log('昵称输入:', e.detail.value);
    this.setData({
      nickname: e.detail.value
    });
  },

  /**
   * 密码输入处理
   */
  onPasswordInput: function(e) {
    console.log('密码输入:', e.detail.value);
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 确认密码输入处理
   */
  onConfirmPasswordInput: function(e) {
    console.log('确认密码输入:', e.detail.value);
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  /**
   * 选择头像事件处理
   */
  selectAvatar: function(e) {
    const selectedUrl = e.currentTarget.dataset.url;
    console.log('选择的头像 URL:', selectedUrl);
    this.setData({
      selectedAvatar: selectedUrl,
      avatarUrl: selectedUrl
    });
  },

  /**
   * 注册功能
   */
  register: function() {
    const { nickname, password, confirmPassword, avatarUrl } = this.data;

    console.log('注册开始，昵称:', nickname, '密码:', password, '确认密码:', confirmPassword, '头像URL:', avatarUrl);

    // 验证输入
    if (!nickname.trim()) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      console.log('昵称为空，注册失败');
      return;
    }

    if (password.length < 8) {
      wx.showToast({
        title: '密码至少8位',
        icon: 'none'
      });
      console.log('密码长度不足，注册失败');
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      console.log('密码与确认密码不一致，注册失败');
      return;
    }

    // 调用云函数进行注册
    wx.cloud.callFunction({
      name: 'register',
      data: {
        nickname,
        password,
        avatarUrl
      },
      success: res => {
        console.log('云函数调用成功:', res);
        if (res.result.success) {
          wx.showToast({
            title: '注册成功',
            icon: 'success'
          });
          // 跳转到个人主页
          wx.navigateTo({
            url: '/pages/profile/profile'
          });
        } else {
          wx.showToast({
            title: res.result.message || '注册失败',
            icon: 'none'
          });
          console.log('注册失败:', res.result.message);
        }
      },
      fail: err => {
        console.error('云函数调用失败:', err);
        wx.showToast({
          title: '注册失败',
          icon: 'none'
        });
      }
    });
  }
});
