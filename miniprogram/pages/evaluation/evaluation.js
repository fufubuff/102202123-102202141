const db = wx.cloud.database();

Page({
  data: {
    rating: 0, // 用户评分（1-5）
    content: '', // 用户评价内容
    evaluatorOpenid: '', // 评价人 openid
    targetOpenid: '', // 评价目标 openid
    ratingText : '没给出态度噢'
  },

  onLoad: function(options) {
    // 获取目标用户的 openid 从 URL 参数
    const targetOpenid = options.targetOpenid || '';
    if (!targetOpenid) {
      wx.showToast({
        title: '缺少目标用户信息',
        icon: 'none'
      });
      wx.navigateBack(); // 返回上一页
      return;
    }
    this.setData({
      targetOpenid: targetOpenid
    });

    // 获取评价人 openid 从本地存储
    const evaluatorOpenid = wx.getStorageSync('user_openid') || '';
    if (!evaluatorOpenid) {
      wx.showToast({
        title: '无法获取当前用户信息，请重新登录',
        icon: 'none'
      });
      wx.navigateBack(); // 返回上一页
      return;
    }
    this.setData({
      evaluatorOpenid: evaluatorOpenid
    });
  },
  selectRating: function(event) {
    const rating = parseInt(event.currentTarget.dataset.rating, 10); // 确保转换为数字
    let newColor = '#0275d8'; // 默认蓝色
    let ratingText = ''; // 初始化评价文本

    switch (rating) {
      case 1: // 注意，现在使用的是数字而不是字符串
        newColor = '#d9534f'; // 差评为红色
        ratingText = '差评';
        break;
      case 2:
        newColor = '#f0ad4e'; // 中评为橙色
        ratingText = '中评';
        break;
      case 3:
        newColor = '#5cb85c'; // 好评为绿色
        ratingText = '好评';
        break;
      case 4:
        newColor = '#0275d8'; // 超好评为蓝色
        ratingText = '超好评';
        break;
      default:
        ratingText = '未评级';
        newColor = '#0275d8'; // 默认蓝色用于未评级或错误处理
        break;
    }

    this.setData({ 
        rating: rating,
        ratingText: ratingText, // 存储文本评分
        submitButtonColor: newColor // 更新按钮颜色
    });
},
  setRating: function(e) {
    const ratingValue = parseInt(e.currentTarget.dataset.value);
    this.setData({
      rating: ratingValue
    });
  },

  updateField: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },
  submitEvaluation: function(e) {
    const { rating,ratingText, content, evaluatorOpenid, targetOpenid } = this.data;

    // 验证评分
    if (rating < 1 || rating > 5) {
      wx.showToast({
        title: '评分请输入1-5之间的数字',
        icon: 'none'
      });
      return;
    }

    // 验证评价内容
    if (!content.trim()) {
      wx.showToast({
        title: '评价内容不能为空',
        icon: 'none'
      });
      return;
    }

    if (content.length < 10) {
      wx.showToast({
        title: '评价内容至少10字',
        icon: 'none'
      });
      return;
    }

    // 验证 openid
    if (!evaluatorOpenid || !targetOpenid) {
      wx.showToast({
        title: '缺少用户信息',
        icon: 'none'
      });
      return;
    }

    // 使用自定义时间格式
    const currentTime = formatTime(new Date());

    // 添加评价到 'cooperationReviews' 集合
    const db = wx.cloud.database();
    db.collection('cooperationReviews').add({
      data: {
        reviewerOpenid: evaluatorOpenid,
        targetOpenid: targetOpenid,
        content: content,
        ratingText: ratingText,
        time: currentTime // 使用格式化的字符串时间
      }
    }).then(res => {
      wx.showToast({
        title: '评价提交成功',
        icon: 'success'
      });
      wx.navigateBack(); // 返回上一页
    }).catch(err => {
      console.error('评价提交失败:', err);
      wx.showToast({
        title: '评价提交失败，请重试',
        icon: 'none'
      });
    });
  }
});
function formatTime(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}