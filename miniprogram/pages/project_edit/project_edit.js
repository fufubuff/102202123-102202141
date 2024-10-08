// 初始化云开发  
wx.cloud.init({  
  env: 'fufubuff-3gt0b01y042179cc', // 云开发环境 ID  
});  
  
Page({  
  data: {  
    inputContent: '', // 用于存储输入框的内容  
    images: [], // 用于存储用户选择的图片路径（本地路径和云存储路径）  
    imageIndexes: [], // 用于跟踪图片的索引，方便删除（实际上如果使用了images的索引，这个可能不需要）  
    type: '', // 用于存储传入的类型（如果有的话）  
    uploadedImageURLs: [] // 用于存储从云存储获取的图片URL  
  },  
  onLoad: function(options) {
    // 检查是否有传入的参数type，并据此设置数据
    if (options.type) {
        const type = options.type; // 确保在使用前已正确获取type
        this.setData({
            type: type,
            inputContent: wx.getStorageSync('currentUser')[type] || ''  // 从本地存储中获取与类型对应的内容
        });
    }

    // 尝试加载图片信息
    this.loadImages();
},

loadImages: function() {
    const latestContent = wx.getStorageSync('latestContent');
    if (latestContent && Array.isArray(latestContent.images) && latestContent.images.length > 0) {
        this.fetchImageURLs(latestContent.images)
            .then(imageURLs => {
                this.setData({
                    uploadedImageURLs: imageURLs,
                    images: latestContent.images
                });
            })
            .catch(error => {
                console.error('获取图片URL失败：', error);
            });
    } else {
        console.warn('没有找到有效的图片信息或图片信息不是数组');
        this.setData({
            uploadedImageURLs: [],
            images: []
        });
    }
},
  
  handleInput: function(e) {
    this.setData({
        inputContent: e.detail.value
    });
    // 更新本地存储
    const { type } = this.data;
    if (type) {
        let latestContent = wx.getStorageSync('latestContent') || {};
        latestContent[type] = e.detail.value;
        wx.setStorageSync('latestContent', latestContent);
    }
},
  
// 选择图片
chooseImage: function() {  
  wx.chooseImage({  
    count: 9,  
    sizeType: ['original', 'compressed'],  
    sourceType: ['album', 'camera'],  
    success: res => {  
      const tempFilePaths = res.tempFilePaths;  
      console.log('选择的图片路径：', tempFilePaths); // 调试信息
      this.setData({  
        images: this.data.images.concat(tempFilePaths)  
      });  
      this.uploadImage(tempFilePaths);  
    }  
  });  
},

// 上传图片到云存储
uploadImage: function(filePaths) {  
  if (!Array.isArray(filePaths) || filePaths.length === 0) {  
    console.warn('没有图片需要上传或传入的参数不是数组');  
    return;  
  }  
  console.log('准备上传的图片路径：', filePaths); // 调试信息

  const promises = filePaths.map(filePath => {  
    return new Promise((resolve, reject) => {  
      const cloudPath = `images/${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;  
      wx.cloud.uploadFile({  
        cloudPath: cloudPath,  
        filePath: filePath,  
        success: res => {  
          console.log('上传成功，文件ID：', res.fileID); // 调试信息
          resolve(res.fileID);  
        },  
        fail: error => {  
          console.error('上传失败：', error); // 调试信息
          reject(error);  
        }  
      });  
    });  
  });

  Promise.all(promises)  
    .then(fileIDs => {  
      console.log('所有文件上传成功，文件ID：', fileIDs); // 调试信息
      this.fetchImageURLs(fileIDs)  
        .then(imageURLs => {  
          this.setData({  
            uploadedImageURLs: this.data.uploadedImageURLs.concat(imageURLs)  
          });  
        })  
        .catch(error => {  
          console.error('获取上传后的图片URL失败：', error);  
        });  
    })  
    .catch(error => {  
      console.error('图片上传失败：', error);  
    });  
},
fetchImageURLs: function(imageFileIDs = []) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: imageFileIDs.map(fileID => ({ fileID, maxAge: 60 * 60 })),
      success: res => {
        const urls = res.fileList.map(file => file.tempFileURL); // 提取所有的tempFileURL
        console.log('获取URL成功：', urls);
        resolve(urls);
      },
      fail: err => {
        console.error('获取URL失败：', err);
        reject(err);
      }
    });
  });
},
handleSubmit: function() {
  const { inputContent, uploadedImageURLs, type } = this.data;
  let latestContent = wx.getStorageSync('latestContent') || {};
  if (type) {
    latestContent[type] = inputContent;
    latestContent.images = uploadedImageURLs; // 确保保存上传后的图片URLs
    wx.setStorageSync('latestContent', latestContent);
    console.log('Data saved:', latestContent);
  }

  wx.showToast({
      title: '提交成功',
      icon: 'success'
  });

  // 返回上一页
  wx.navigateBack();
}
});