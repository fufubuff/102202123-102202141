const app = getApp();
const db = wx.cloud.database();
let openid = wx.getStorageSync('user_openid'); // 保留从本地获取用户 openid

Page({
  data: {
    userName: '',
    contact: '',
    peopleNeeded: '',
    projectDescription: '项目资料详细内容...',
    displayText: '',
    maxLength: 80,
    personNeed: '人员需求详细内容...',
    displayPersonText: '',
    keyword1: '',
    keyword2: '',
    keyword3: '',
    currentKeywordIndex: 0,
    currentUserAvatar: '',
    isEditingProjectDescription: false, // 控制是否显示项目描述编辑状态
    isEditingPersonNeed: false, // 控制是否显示人员需求编辑状态
    projectNamePlaceholder: '请设置项目名称' // 项目名称占位符
  },

  onLoad: function () {
    this.initData();
  },

  onShow: function () {
    this.initData();
    this.setDisplayText();
    this.setDisplayPersonText();
  },

  initData: function () {
    const that = this;
    console.log('当前用户的 openid:', openid);
    const usersCollection = db.collection('users');

    // 获取用户信息
    usersCollection.doc(openid).get()
      .then(res => {
        if (res.data) {
          console.log('获取到的用户信息:', res.data);
          const currentUser = res.data;  // 使用局部变量
          that.setDataFromUser(currentUser);
        } else {
          console.warn('No user data available');
          that.setFallbackData();
        }
      })
      .catch(err => {
        console.error('获取用户信息失败：', err);
        that.setFallbackData();
      });
  },

  setDataFromUser: function (user) {
    this.setData({
      userName: user.name,
      currentUserAvatar: user.avatarUrl || '',
      contact: user.contact || '',
      peopleNeeded: user.peopleNeeded || '',
      projectNamePlaceholder: user.projectName || '',
      projectDescription: user.projectDescription || '项目资料详细内容...',
      personNeed: user.personNeed || '人员需求详细内容...'
    });
    this.setDisplayText();
    this.setDisplayPersonText();
  },

  setFallbackData: function () {
    this.setData({
      userName: '默认用户名',
      currentUserAvatar: '',
      contact: '',
      peopleNeeded: '',
      projectNamePlaceholder: '',
      projectDescription: '项目资料详细内容...',
      personNeed: '人员需求详细内容...'
    });
    this.setDisplayText();
    this.setDisplayPersonText();
  },

  // 编辑项目名称
  editProjectName: function (e) {
    this.setData({
      projectNamePlaceholder: e.detail.value
    });
  },

  // 编辑联系方式
  editContact: function (e) {
    this.setData({
      contact: e.detail.value
    });
  },

  // 编辑人数缺口
  editPeopleNeeded: function (e) {
    this.setData({
      peopleNeeded: e.detail.value
    });
  },

  // 启用项目描述编辑
  enableProjectDescriptionEdit: function () {
    this.setData({
      isEditingProjectDescription: true
    });
  },

  // 编辑项目描述内容
  editProjectDescription: function (e) {
    this.setData({
      projectDescription: e.detail.value
    });
  },

  // 保存项目描述编辑
  saveProjectDescriptionEdit: function () {
    this.setData({
      isEditingProjectDescription: false,
      displayText: this.truncateText(this.data.projectDescription, this.data.maxLength)
    });
  },

  // 启用人员需求编辑
  enablePersonNeedEdit: function () {
    this.setData({
      isEditingPersonNeed: true
    });
  },

  // 编辑人员需求内容
  editPersonNeed: function (e) {
    this.setData({
      personNeed: e.detail.value
    });
  },

  // 保存人员需求编辑
  savePersonNeedEdit: function () {
    this.setData({
      isEditingPersonNeed: false,
      displayPersonText: this.truncateText(this.data.personNeed, this.data.maxLength)
    });
  },

  // 处理关键词输入事件
  onKeywordInput: function (e) {
    const index = e.currentTarget.dataset.index; // 获取当前输入的关键词索引
    const value = e.detail.value; // 获取输入的关键词值

    // 根据索引更新相应的数据字段
    if (index === '0') {
      this.setData({ keyword1: value });
    } else if (index === '1') {
      this.setData({ keyword2: value });
    } else if (index === '2') {
      this.setData({ keyword3: value });
    }
  },

  /**
   * 提交队友招募详情至数据库
   */
  submitDetails: function () {
    const { contact, peopleNeeded, projectDescription, personNeed, keyword1, keyword2, keyword3 } = this.data;

    if (!contact || !peopleNeeded || !projectDescription || !personNeed || !keyword1 || !keyword2 || !keyword3) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 获取当前用户的 openid
    let openid = wx.getStorageSync('user_openid');

    if (!openid) {
      wx.showToast({
        title: '用户未登录，请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/dengru/newpage' // 跳转到登录页面
      });
      return;
    }

    // 数据库集合名称为 'recruitmentPosts'，请根据需要更改
    db.collection('recruitmentPosts').add({
      data: {
        _id: db.serverDate(), // 或者使用自定义唯一ID
        id: Math.floor(Math.random() * 1000), // 生成一个随机id，可根据需要进行修改
        openid: openid, // 添加发布人的 openid
        tags: [keyword1, keyword2, keyword3], // 数据库中保存关键词作为 
        time: new Date().toLocaleString(), // 保存当前的日期和时间
        title: projectDescription, // 保存项目描述为标题
        contact: contact, // 添加联系方式
        peopleNeeded: peopleNeeded, // 添加人员需求
        personNeed: personNeed, // 添加人员需求详细信息
      },
      success: res => {
        wx.showToast({
          title: '数据保存成功',
          icon: 'success'
        });
        this.clearUserData(); // 保存成功后清除数据
        wx.navigateBack(); // 可选：返回上一页
      },
      fail: err => {
        console.error('数据保存失败:', err);
        wx.showToast({
          title: '数据保存失败',
          icon: 'none'
        });
      }
    });
  },

  clearUserData: function () {
    // 清空页面的数据
    this.setData({
      userName: '',
      currentUserAvatar: '',
      contact: '',
      peopleNeeded: '',
      projectDescription: '',
      personNeed: '',
      keyword1: '',
      keyword2: '',
      keyword3: '',
      projectNamePlaceholder: '',
      displayText: '',
      displayPersonText: '',
      currentKeywordIndex: 0,
      isConfirming: false,
      isEditingProjectDescription: false,
      isEditingPersonNeed: false
    });
  },

  // 设置显示的项目描述文本
  setDisplayText: function () {
    this.setData({
      displayText: this.truncateText(this.data.projectDescription, this.data.maxLength)
    });
  },

  // 设置显示的人员需求文本
  setDisplayPersonText: function () {
    this.setData({
      displayPersonText: this.truncateText(this.data.personNeed, this.data.maxLength)
    });
  },

  /**
   * 截断文本
   */
  truncateText: function (text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  },
});
