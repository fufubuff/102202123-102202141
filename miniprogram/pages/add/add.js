Page({  
  navigateToFindTeam: function() {  
    // 使用 wx.navigateTo 跳转到 find_team 页面  
    wx.navigateTo({  
      url: '/pages/find_team/find_team' // 确保这里的路径是正确的  
    });  
  },  
  // 绑定到按钮点击事件的方法  
  switchToFind: function() {  
    this.navigateToFindTeam(); // 调用 navigateToFindTeam 函数进行跳转  
  },  
    
  
    
  selfRecommend: function() {  
    // 显示正在自我推荐的提示  
    wx.showToast({  
      title: '正在自我推荐...',  
      icon: 'none'  
    });  
  
    // 跳转到 self_recommendation 页面  
    wx.navigateTo({  
      url: '/pages/self_recommendation/self_recommendation' // 确保这里的路径是正确的  
    });  
  
    // 你可以在这里调用API或其他逻辑（如果需要的话，可以在跳转前或跳转后执行）  
    // 例如，如果你想要在跳转前发送自我推荐的数据到服务器，可以在这里添加代码  
  },
    
  closePage: function() {  
    // 关闭当前页面的逻辑  
    wx.navigateBack({  
      delta: 1  
    });  
  }  
});