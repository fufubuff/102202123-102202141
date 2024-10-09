const db = wx.cloud.database();
let openid = wx.getStorageSync('user_openid');  
Page({
  data: {
    userName: '',
    userAvatar: '',
    contact: '',
    peopleNeeded: '',
    projectName: '',
    projectDescription: '',
    personNeed: '',
    keyword1: '',
    keyword2: '',
    keyword3: '',
    maxLength: 80,
  },

  onLoad: function (options) {
    this.initData(options.id);
  },

  initData: function (id) {
    const that = this;
    db.collection('recruitmentPosts').doc(id).get().then(res => {
      const postDetails = res.data;
      db.collection('users').where({
        openid: postDetails.openid
      }).get().then(userRes => {
        if (userRes.data.length > 0) {
          const userDetails = userRes.data[0];
          that.setData({
            userName: userDetails.name,
            userAvatar: userDetails.avatarUrl,
            contact: postDetails.contact,
            peopleNeeded: postDetails.peopleNeeded,
            projectName: postDetails.title,
            projectDescription: postDetails.projectDescription,
            personNeed: postDetails.personNeed,
            keyword1: postDetails.tags[0] || '',
            keyword2: postDetails.tags[1] || '',
            keyword3: postDetails.tags[2] || ''
          });
        } else {
          console.warn('No user data found for openid:', postDetails._openid);
          that.setData({
            userName: '未知用户',
            userAvatar: '/images/default-avatar.png',
            contact: postDetails.contact,
            peopleNeeded: postDetails.peopleNeeded,
            projectName: postDetails.title,
            projectDescription: postDetails.projectDescription,
            personNeed: postDetails.personNeed,
            keyword1: postDetails.tags[0] || '',
            keyword2: postDetails.tags[1] || '',
            keyword3: postDetails.tags[2] || ''
          });
        }
      }).catch(userErr => {
        console.error('获取用户信息失败:', userErr);
        that.setData({
          userName: '未知用户',
          userAvatar: '/images/default-avatar.png',
          contact: postDetails.contact,
          peopleNeeded: postDetails.peopleNeeded,
          projectName: postDetails.title,
          projectDescription: postDetails.projectDescription,
          personNeed: postDetails.personNeed,
          keyword1: postDetails.tags[0] || '',
          keyword2: postDetails.tags[1] || '',
          keyword3: postDetails.tags[2] || ''
        });
      });
    }).catch(err => {
      console.error('获取详情信息失败:', err);
    });
  }
});