const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    currentUserId: '',
    chatUserId: '',
    chatUserInfo: {},
    currentUserInfo: {},
    messageList: [],
    inputContent: '',
    watcher: null,
    scrollIntoView: '',
    openid:'',
  },
  onImageError: function(e) {
    const defaultAvatar = 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'; // 假定这是你的默认头像路径
    const index = e.currentTarget.dataset.index;
    const updatedList = this.data.messageList.map((item, idx) => {
        if (idx === index) {
            item.fromAvatarUrl = defaultAvatar;
        }
        return item;
    });
    this.setData({
        messageList: updatedList
    });
},
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
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
    // 获取当前用户的 openid
    this.getUserOpenId().then(openid => {
      this.setData({ currentUserId: openid });
      // 获取聊天对象的信息
      this.getUserInfo(chatUserId, 'chatUserInfo');
      // 获取当前用户的信息
      this.getUserInfo(openid, 'currentUserInfo');
      // 初始化消息监听
      this.initWatcher();
    }).catch(err => {
      console.error('获取 openid 失败', err);
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

  getUserOpenId: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          const openid = res.result.openid;
          resolve(openid);
        },
        fail: err => {
          reject(err);
        }
      });
    });
  },

  getUserInfo: function(openid, dataField) {
    const that = this;
    db.collection('users').where({
      openid: openid
    }).get({
      success: function(res) {
        if (res.data.length > 0) {
          let userInfo = res.data[0];
          console.log('用户头像地址', userInfo);
  
          // 确保 avatarUrl 是相对路径
          if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith('cloud')) {
            userInfo.avatarUrl = 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/' + userInfo.avatarUrl;
          }
  
          that.setData({
            [dataField]: userInfo
          });
        } else {
          console.error('未找到用户信息，openid:', openid);
        }
      },
      fail: function(err) {
        console.error('获取用户信息失败', err);
      }
    });
  },

  initWatcher: function() {
    const { currentUserId, chatUserId } = this.data;
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

  onChange: function(snapshot) {
    // 更新消息列表
    if (snapshot.type === 'init') {
      this.setData({
        messageList: snapshot.docs
      }, () => {
        this.scrollToBottom();
      });
    } else {
      const newList = this.data.messageList.concat(snapshot.docChanges.map(change => change.doc));
      this.setData({
        messageList: newList
      }, () => {
        this.scrollToBottom();
      });
    }
  },

  onError: function(err) {
    console.error('监听出错：', err);
  },

  scrollToBottom: function() {
    this.setData({
      scrollIntoView: 'msg-' + (this.data.messageList.length - 1)
    });
  },

  onInput: function(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  onSendMessage: function() {
    const content = this.data.inputContent.trim();
    if (!content) return;

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

  checkMessageContent: function(content) {
    // 可选的内容安全检查
    return new Promise((resolve) => {
      resolve();
    });
  },

  sendMessage: function(content) {
    const { currentUserId, chatUserId, currentUserInfo } = this.data;
    db.collection('messages').add({
      data: {
        fromUserId: currentUserId,
        toUserId: chatUserId,
        content: content,
        timestamp: new Date(),
        isRead: false,
        fromAvatarUrl: currentUserInfo.avatarUrl,
        fromNickname: currentUserInfo.nickname,
      }
    }).then(res => {
      this.setData({
        inputContent: ''
      });
    }).catch(err => {
      console.error('消息发送失败', err);
    });
  },

  formatTime: function(date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
});