Page({  
  data: {  
    inputContent: '', // 用于存储输入框的内容  
    type: '' // 用于存储传入的类型（如果有的话）  
  },  
  
  onLoad: function(options) {  
    // 如果有type参数，则设置type，并从本地存储中获取对应类型的文本（如果存在）  
    if (options.type) {  
      this.setData({  
        type: options.type,  
        inputContent: wx.getStorageSync('currentUser')[options.type] || ''  
      });  
    }  
  },  
  
  // 处理文本输入  
  handleInput: function(e) {  
    this.setData({  
      inputContent: e.detail.value // 更新inputContent为当前输入值  
    });  
  },  
// Handling text input and saving to local storage in person_need.js
handleSubmit: function() {
  const { inputContent, type } = this.data;

  // Save input content to local storage based on the specified type
  if (type) {
    let currentUser = wx.getStorageSync('currentUser') || {};
    currentUser[type] = inputContent;
    wx.setStorageSync('currentUser', currentUser);
  }

  wx.showToast({
    title: '提交成功',
    icon: 'success',
    duration: 2000,
    success: function() {
      wx.navigateBack();
    }
  });
}

});
