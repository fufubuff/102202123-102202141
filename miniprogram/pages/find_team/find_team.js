// 首先获取 openid 并定义为全局变量  
let openid = wx.getStorageSync('openid');  
const app = getApp();  
const db = wx.cloud.database();  
let currentUser = null; // 定义 currentUser 变量  
let latestContent = null; // 定义 latestContent 变量  
Page({  
  data: {  
    userName: '', // 需确保此名字与当前登录的用户名一致  
    contact: '',  
    peopleNeeded: '',  
    projectDescription: '项目资料详细内容...',  
    displayText: '', // 初始化为空字符串，将在页面加载时设置（用于项目描述）  
    maxLength: 80,  
    personNeed: '人员需求详细内容...',  
    displayPersonText: '', // 初始化为空字符串，将在页面加载时设置（用于人员需求）  
    keyword1: '',  
    keyword2: '',  
    keyword3: '',  
    currentKeywordIndex: 0, // 当前需要确认的关键词索引  
    keywordsToConfirm: [' 关键词1 专业：', ' 关键词2：学历层次 ', ' 关键词3：合作方向 '], // 需要确认的关键词列表  
    projectNamePlaceholder: '请设置项目名称', // 初始项目名称占位符
    currentUserAvatar: '' // 初始化为空字符串，稍后将设置为当前用户的头像URL  
  },
  clearUserData: function() {
    // Clear all user-specific data stored
    wx.removeStorageSync('currentUser'); // Remove the currentUser object from storage
    wx.removeStorageSync('latestContent'); // Optionally remove this if it is no longer needed
  
    // Reset all related data properties to their initial state
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
      uploadedImageURLs: [], // Ensure the image URLs are also reset
      images: [] // Reset local image paths if being used
    });
  },
  onLoad: function() {  
    // 每次页面加载时获取 openid  
    this.getOpenIdAndInitData();  
  },  
  
  onShow: function() {  
    // 每次页面显示时刷新数据（如果需要）  
    // this.initData(); // 如果在 onLoad 中已经初始化，这里可能不需要重复初始化  
    this.setDisplayText();  
    this.setDisplayPersonText();  
  },  
  
  getOpenIdAndInitData: function() {  
    const that = this;  
    // 从本地存储中获取 openid  
    const openid = wx.getStorageSync('openid');  
    if (openid) {  
      console.log('当前用户的 openid:', openid);  
      const usersCollection = db.collection('users');  
  
      // 使用 openid 获取用户信息  
      usersCollection.doc(openid).get()  
        .then(res => {  
          if (res.data) {  
            console.log('获取到的用户信息:', res.data);  
            currentUser = res.data;  
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
  
      // 获取最新的内容（如果需要）  
      let latestContent = wx.getStorageSync('latestContent');  
      if (latestContent) {  
        that.updateDataWithLatestContent(latestContent);  
      } else {  
        console.warn('No latestContent found');  
      }  
    } else {  
      // 处理没有 openid 的情况，可能需要跳转到登录页面  
      wx.reLaunch({  
        url: '/pages/dengru/newpage'  
      });  
    }  
  },  
setDataFromUser: function(user) {
    this.setData({
        userName: user.nickname,
        currentUserAvatar: user.avatarUrl || '',
        contact: user.contact || '',
        peopleNeeded: user.peopleNeeded || '',
        projectNamePlaceholder: user.projectName || ''
    });
},

setFallbackData: function() {
    this.setData({
        userName: '默认用户名',
        currentUserAvatar: '',
        contact: '',
        peopleNeeded: '',
        projectNamePlaceholder: ''
    });
},
updateDataWithLatestContent: function(latestContent) {
  // Ensure that the latest edits are used
  const currentUser = wx.getStorageSync('currentUser');
  if (currentUser) {
    this.setData({
      projectDescription: currentUser.projectDescription || this.data.projectDescription,
      personNeed: currentUser.personNeed || this.data.personNeed
    });
  }
},


  // 编辑联系方式      
  editContact: function(e) {      
    this.setData({      
      contact: e.detail.value      
    });      
  },      
      
  // 编辑人数缺口      
  editPeopleNeeded: function(e) {      
    this.setData({      
      peopleNeeded: e.detail.value      
    });  
  },
  // 编辑项目名称
  editProjectName: function(e) {      
    this.setData({      
      projectNamePlaceholder: e.detail.value      
    });  
  },    
  
  // 截断文本并添加省略号（如果需要）  
  truncateText: function(text, maxLength) {  
    if (text.length > maxLength) {  
      return text.substring(0, maxLength) + '...';  
    }  
    return text;  
  },  
    
  setDisplayText: function() {      
    // 直接使用项目描述的数据，因为已经在editContact中实时更新  
    this.setData({  
      displayText: this.truncateText(this.data.projectDescription, this.data.maxLength)  
    });  
  },    
    
  setDisplayPersonText: function() {      
    // 直接使用人员需求的数据，因为已经在editPeopleNeeded中实时更新  
    this.setData({  
      displayPersonText: this.truncateText(this.data.personNeed, this.data.maxLength)  
    });  
  },         
    
  navigateToEditPage: function() {  
    wx.navigateTo({  
      url: '/pages/project_edit/project_edit?type=projectDescription'  
    });  
  },  
  
  navigateToEditPerson: function() {  
    wx.navigateTo({  
      url: '/pages/person_need/person_need?type=personNeed'  
    });  
  },   
 
  // 处理关键词输入事件  
  onKeywordInput: function(e) {  
    const index = e.currentTarget.dataset.index; // 获取当前输入的关键词索引  
    const value = e.detail.value; // 获取输入的关键词值  
  
    // 根据索引更新相应的数据字段  
    switch (index) {  
      case '0':  
        this.setData({ keyword1: value });  
        break;  
      case '1':  
        this.setData({ keyword2: value });  
        break;  
      case '2':  
        this.setData({ keyword3: value });  
        break;  
    }  
  },  
  submitDetails: function() {
    const { contact, peopleNeeded, projectDescription, personNeed, keyword1, keyword2, keyword3, uploadedImageURLs } = this.data;
  
    if (!contact || !peopleNeeded || !projectDescription || !personNeed || !keyword1 || !keyword2 || !keyword3) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
  
    wx.cloud.callFunction({
      name: 'submitTeamRecruitment',
      data: {
        contact: contact,
        peopleNeeded: peopleNeeded,
        projectDescription: projectDescription,
        personNeed: personNeed,
        keywords: [keyword1, keyword2, keyword3],
        images: uploadedImageURLs  // Ensure to pass images if needed
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({
            title: '数据保存成功',
            icon: 'success'
          });
          this.clearUserData(); // Call to clear data after successful submission
          wx.navigateBack(); // Optionally navigate back
        } else {
          wx.showToast({
            title: '数据保存失败: ' + res.result.message,
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('调用云函数失败', err);
        wx.showToast({
          title: '调用云函数失败',
          icon: 'none'
        });
      }
    });
  },
// 显示关键词确认对话框  
showKeywordConfirmation: function() {  
  if (!this.data.isConfirming) {  
    // 如果当前不是确认状态，则不显示对话框并返回  
    return;  
  }  
  
  const index = this.data.currentKeywordIndex;  
  let currentKeywordValue = '';  
  switch (index) {  
    case 0:  
      currentKeywordValue = this.data.keyword1;  
      break;  
    case 1:  
      currentKeywordValue = this.data.keyword2;  
      break;  
    case 2:  
      currentKeywordValue = this.data.keyword3;  
      break;  
  }  
  const currentKeywordLabel = this.data.keywordsToConfirm[index];  
  wx.showModal({  
    title: '确认关键词',  
    content: `请确认${currentKeywordLabel}${currentKeywordValue}是否正确`,  
    success: (res) => {  
      if (res.confirm) {  
        // 用户点击了确认按钮  
        this.saveKeywordAndProceed();  
      } else {  
        // 用户点击了取消按钮，重置索引并停止确认流程  
        wx.showToast({  
          title: '确认已取消，请重新编辑后再次确认',  
          icon: 'none'  
        });  
        this.setData({  
          currentKeywordIndex: 0,  
          isConfirming: false // 设置标志位为false，表示当前不在确认状态  
        });  
      }  
    }  
  });  
},  
  
// 保存关键词并继续下一个  
saveKeywordAndProceed: function() {  
  // 增加当前关键词索引  
  this.setData({  
    currentKeywordIndex: this.data.currentKeywordIndex + 1  
  });  
  
  // 检查是否还有下一个关键词需要确认  
  if (this.data.currentKeywordIndex < this.data.keywordsToConfirm.length) {  
    // 显示下一个关键词的确认对话框  
    this.showKeywordConfirmation();  
  } else {  
    // 所有关键词都已确认，保存项目详情并返回到add界面  
    wx.setStorage({  
      key: 'currentUser',  
      data: {  
        userName: this.data.userName,  
        contact: this.data.contact, 
        peopleNeeded: this.data.peopleNeeded,  
        projectDescription: this.data.projectDescription,  
        personNeed: this.data.personNeed,  
        keyword1: this.data.keyword1,  
        keyword2: this.data.keyword2,  
        keyword3: this.data.keyword3,  
    },
    success: function() {  
      console.log('数据保存成功');  
    },  
    fail: function() {  
      console.error('数据保存失败');  
    }  
  });
  
    wx.showToast({  
      title: '提交成功',  
      icon: 'success',  
      duration: 2000,  
      success: () => {  
        // 返回到add界面  
        wx.navigateBack({  
          delta: 1 // 假设从add界面跳转到当前界面时使用了wx.navigateTo  
        });  
      }  
    }); 
    
    // 返回上一页
  wx.navigateBack();
  
    // 重置确认状态  
    this.setData({  
      isConfirming: false  
    });  
  }  
},
clearUserData: function() {
  // Clear all user-specific data stored
  wx.removeStorageSync('currentUser'); // Remove the currentUser object from storage
  wx.removeStorageSync('latestContent'); // Optionally remove this if it is no longer needed

  // Reset all related data properties to their initial state
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
    isConfirming: false
  });
}, 
});
