// pages/chat/chat.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    currentUserId: '',      // 当前用户的 user_openid
    chatUserId: '',         // 聊天对象的 user_openid
    chatUserInfo: {},       // 聊天对象的用户信息
    currentUserInfo: {},    // 当前用户的用户信息
    messageList: [],        // 聊天消息列表
    inputContent: '',       // 输入框内容
    watcher: null,          // 消息监听器
    scrollIntoView: '',     // 用于滚动到最新消息
  },

  /**
   * 格式化时间戳为 HH:MM
   * @param {Date} timestamp - 消息的时间戳
   * @returns {String} 格式化后的时间字符串
   */
  formatTime: function(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  onLoad: function(options) {
    const chatUserId = options.chatUserId;
    if (!chatUserId) {
      wx.showToast({
        title: '聊天对象不存在',
        icon: 'none'
      });
      return;
    }
    this.setData({ chatUserId });

    // 获取当前用户的 user_openid
    this.loadUserOpenId().then(openid => {
      this.setData({ currentUserId: openid });
      // 获取聊天对象的信息
      this.getUserInfo(chatUserId, 'chatUserInfo');
      // 获取当前用户的信息
      this.getUserInfo(openid, 'currentUserInfo');
      // 初始化消息监听
      this.initWatcher();
      // 标记消息为已读
      this.markMessagesAsRead();
    }).catch(err => {
      console.error('获取 user_openid 失败', err);
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    });
  },

  onUnload: function() {
    if (this.data.watcher) {
      this.data.watcher.close();
    }
  },

  /**
   * 从全局数据或本地存储中获取 'user_openid'
   */
  loadUserOpenId: function() {
    return new Promise((resolve, reject) => {
      const userOpenid = wx.getStorageSync('user_openid');
      if (userOpenid) {
        resolve(userOpenid);
      } else if (app.globalData.user_openid) {
        resolve(app.globalData.user_openid);
      } else {
        reject('未找到 user_openid');
      }
    });
  },

  /**
   * 获取用户信息并设置到对应的 data 字段
   * @param {String} openid - 用户的 openid
   * @param {String} dataField - 要设置的数据字段名
   */
  getUserInfo: function(openid, dataField) {
    const that = this;
    db.collection('users').where({
      openid: openid
    }).get({
      success: function(res) {
        if (res.data.length > 0) {
          let userInfo = res.data[0];
          console.log('用户信息:', userInfo);

          // 确保 avatarUrl 是绝对路径
          if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith('cloud')) {
            userInfo.avatarUrl = 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/' + userInfo.avatarUrl;
          }

          that.setData({
            [dataField]: userInfo
          });
        } else {
          console.error('未找到用户信息，openid:', openid);
          wx.showToast({
            title: '未找到用户信息',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(err) {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 初始化消息监听
   */
  initWatcher: function() {
    const { currentUserId, chatUserId } = this.data;
    if (!currentUserId || !chatUserId) return;

    const watcher = db.collection('messages')
      .where(_.or([
        {
          fromUserId: currentUserId,
          toUserId: chatUserId
        },
        {
          fromUserId: chatUserId,
          toUserId: currentUserId
        }
      ]))
      .orderBy('timestamp', 'asc')
      .watch({
        onChange: this.onChange.bind(this),
        onError: this.onError.bind(this)
      });
    this.setData({ watcher });
  },

  /**
   * 监听消息变化
   */
  onChange: function(snapshot) {
    // 更新消息列表
    if (snapshot.type === 'init') {
      // 初始化时设置消息列表
      const formattedMessages = snapshot.docs.map(msg => ({
        ...msg,
        formattedTime: this.formatTime(msg.timestamp)
      }));
      this.setData({
        messageList: formattedMessages
      }, () => {
        this.scrollToBottom();
      });
    } else {
      // 新增消息时添加到列表
      const newMessages = snapshot.docChanges
        .filter(change => change.type === 'add')
        .map(change => ({
          ...change.doc,
          formattedTime: this.formatTime(change.doc.timestamp)
        }));
      if (newMessages.length > 0) {
        this.setData({
          messageList: this.data.messageList.concat(newMessages)
        }, () => {
          this.scrollToBottom();
        });
      }
    }
  },

  /**
   * 监听错误
   */
  onError: function(err) {
    console.error('监听出错：', err);
    wx.showToast({
      title: '实时更新出错，请稍后再试',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 滚动到最新消息
   */
  scrollToBottom: function() {
    if (this.data.messageList.length > 0) {
      this.setData({
        scrollIntoView: 'msg-' + (this.data.messageList.length - 1)
      });
    }
  },

  /**
   * 输入框内容变化
   */
  onInput: function(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  onSendMessage: function() {
    const content = this.data.inputContent.trim();
    if (!content) {
      wx.showToast({
        title: '消息内容不能为空',
        icon: 'none'
      });
      return;
    }

    // 发送前进行内容安全检查（可选）
    this.checkMessageContent(content).then(() => {
      this.sendMessage(content);
    }).catch(err => {
      wx.showToast({
        title: '消息内容违规',
        icon: 'none'
      });
    });
  },

  /**
   * 内容安全检查（可选）
   * @param {String} content - 消息内容
   */
  checkMessageContent: function(content) {
    // 可选的内容安全检查逻辑
    return new Promise((resolve, reject) => {
      // 示例：禁止发送特定词语
      const forbiddenWords = ['张栋', "黄昕怡", "张铭心", "傻逼", "他妈", "吴越钟"];
      const containsForbidden = forbiddenWords.some(word => content.includes(word));
      if (containsForbidden) {
        reject('包含敏感词');
      } else {
        resolve();
      }
    });
  },

  /**
   * 发送消息到数据库
   * @param {String} content - 消息内容
   */
  sendMessage: function(content) {
    const { currentUserId, chatUserId, currentUserInfo } = this.data;
    if (!currentUserId || !chatUserId) {
      wx.showToast({
        title: '用户信息不完整',
        icon: 'none'
      });
      return;
    }

    const newMessage = {
      fromUserId: currentUserId,
      toUserId: chatUserId,
      content: content,
      timestamp: db.serverDate(), // 使用服务器时间
      isRead: false,
      fromAvatarUrl: currentUserInfo.avatarUrl,
      fromNickname: currentUserInfo.nickname,
    };

    db.collection('messages').add({
      data: newMessage
    }).then(res => {
      // 获取添加的消息，以获取服务器时间戳
      db.collection('messages').doc(res._id).get().then(docRes => {
        const messageWithTime = {
          ...docRes.data,
          formattedTime: this.formatTime(docRes.data.timestamp)
        };
        // 立即将消息添加到 messageList
        this.setData({
          messageList: this.data.messageList.concat([messageWithTime]),
          inputContent: '',
          scrollIntoView: 'msg-' + (this.data.messageList.length)
        });
        this.scrollToBottom();
      }).catch(err => {
        console.error('获取新消息失败', err);
        wx.showToast({
          title: '消息发送失败',
          icon: 'none'
        });
      });
    }).catch(err => {
      console.error('消息发送失败', err);
      wx.showToast({
        title: '消息发送失败',
        icon: 'none'
      });
    });
  },

  /**
   * 标记所有从对方发送给当前用户的消息为已读
   */
  markMessagesAsRead: function() {
    const { currentUserId, chatUserId } = this.data;
    db.collection('messages').where({
      fromUserId: chatUserId,
      toUserId: currentUserId,
      isRead: false
    }).update({
      data: {
        isRead: true
      },
      success: res => {
        console.log('已读消息更新成功', res);
        // 不再需要手动调用 fetchFriendsWithUnreadCount
        // 因为 friends.js 的监听器会自动更新未读计数
      },
      fail: err => {
        console.error('更新已读消息失败', err);
        wx.showToast({
          title: '更新已读消息失败',
          icon: 'none'
        });
      }
    });
  },

});
