const app = getApp(); 
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    friends: [],          // 全部好友列表
    searchKeyword: '',    // 搜索关键词
    searchResults: [],    // 搜索结果列表
    isSearching: false,   // 是否正在搜索
    isLoading: false,     // 是否正在加载
    debounceTimer: null,  // 防抖定时器
    pageSize: 20,         // 每页加载的数量
    currentPage: 1,       // 当前页数
    currentUserOpenId: '',// 当前用户的 user_openid
    totalCount: 0,        // 好友总数（用于分页）
    watcher: null,        // 消息监听器
  },

  onLoad: function(options) {  
    this.loadUserOpenId().then(openid => {
      this.setData({ currentUserOpenId: openid });
      console.log('当前用户的 user_openid:', openid);
      this.fetchFriendsWithUnreadCount(); // 获取所有好友并附带未读消息数量
      this.initWatcher(); // 初始化消息监听
    }).catch(err => {
      console.error('获取 user_openid 失败:', err);
      wx.showToast({
        title: '获取用户信息失败，请稍后再试',
        icon: 'none'
      });
      // 跳转到登录页面
      wx.reLaunch({
        url: '/pages/dengru/newpage'
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
      const openid = app.getUserOpenid(); // 使用全局方法获取 openid
      if (openid) {
        resolve(openid);
      } else {
        reject('未找到 user_openid');
      }
    });
  },

  /**
   * 获取全部好友，支持分页，并获取未读消息数量
   */
  fetchFriendsWithUnreadCount: function() {
    const that = this;
    const { pageSize, currentPage } = this.data;
    this.setData({ isLoading: true });

    db.collection('users')
      .where({
        openid: db.command.neq(that.data.currentUserOpenId) // 排除当前用户
      })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .get({
        success: async function(res) {
          const friends = res.data;
          // 获取好友总数
          db.collection('users').where({
            openid: db.command.neq(that.data.currentUserOpenId)
          }).count().then(countRes => {
            that.setData({
              totalCount: countRes.total
            });
          });

          // 为每个好友获取未读消息数量
          const friendsWithUnread = await Promise.all(friends.map(async (friend) => {
            const count = await that.getUnreadCount(friend.openid);
            return {
              ...friend,
              unreadCount: count
            };
          }));
          const newFriends = that.data.friends.concat(friendsWithUnread);
          that.setData({
            friends: newFriends,
            currentPage: that.data.currentPage + 1,
            isLoading: false
          });
        },
        fail: function(err) {
          console.error('获取好友列表失败：', err);
          wx.showToast({
            title: '获取好友列表失败：' + err.message,
            icon: 'none'
          });
          that.setData({ isLoading: false });
        }
      });
  },

  /**
   * 获取与某个好友的未读消息数量
   * @param {String} friendOpenid - 好友的 openid
   */
  getUnreadCount: function(friendOpenid) {
    return db.collection('messages').where({
      fromUserId: friendOpenid,
      toUserId: this.data.currentUserOpenId,
      isRead: false
    }).count().then(res => res.total).catch(err => {
      console.error('获取未读消息数量失败', err);
      return 0;
    });
  },

  /**
   * 处理输入事件，添加防抖
   */
  onSearchInput: function(e) {
    const value = e.detail.value;
    this.setData({
      searchKeyword: value
    });

    // 清除之前的定时器
    if (this.data.debounceTimer) {
      clearTimeout(this.data.debounceTimer);
    }

    // 如果搜索关键词为空，显示全部好友列表
    if (value.trim() === '') {
      this.setData({
        isSearching: false,
        searchResults: []
      });
      return;
    }

    // 设置新的定时器
    this.setData({
      debounceTimer: setTimeout(() => {
        this.performSearch();
      }, 500) // 500ms 后执行搜索
    });
  },

  /**
   * 执行实际的搜索操作
   */
  performSearch: function() {
    const keyword = this.data.searchKeyword.trim();
    const that = this;

    if (keyword === '') {
      // 如果搜索关键词为空，显示全部好友列表
      this.setData({
        isSearching: false,
        searchResults: []
      });
      return;
    }

    this.setData({
      isSearching: true,
      searchResults: [],
      isLoading: true
    });

    // 使用正则表达式进行模糊搜索，排除当前用户
    db.collection('users')
      .where({
        openid: db.command.neq(that.data.currentUserOpenId), // 排除当前用户
        nickname: db.RegExp({
          regexp: keyword,
          options: 'i' // 不区分大小写
        })
      })
      .get({
        success: async function(res) {
          console.log('搜索结果：', res.data);
          const results = await Promise.all(res.data.map(async (user) => {
            const count = await that.getUnreadCount(user.openid);
            const regex = new RegExp(`(${keyword})`, 'gi');
            const highlightedNickname = user.nickname.replace(regex, '<span style="color: #3cc51f;">$1</span>');
            return {
              ...user,
              highlightedNickname,
              unreadCount: count
            };
          }));
          that.setData({
            searchResults: results,
            isLoading: false
          });
          if (res.data.length === 0) {
            wx.showToast({
              title: '未找到匹配的用户',
              icon: 'none'
            });
          }
        },
        fail: function(err) {
          console.error('搜索失败：', err);
          that.setData({
            isLoading: false
          });
          wx.showToast({
            title: '搜索失败',
            icon: 'none'
          });
        }
      });
  },

  /**
   * 处理头像加载错误，设置默认头像
   */
  onImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    const type = this.data.isSearching ? 'searchResults' : 'friends';
    const list = this.data[type];

    if (list[index]) {
      list[index].avatarUrl = '/images/default_avatar.png'; // 确保您有一张默认头像图片，路径相对于项目根目录
      this.setData({
        [type]: list
      });
    }
  },

  /**
   * 选择好友，进入聊天界面
   */
  onSelectFriend: function(e) {
    const friendOpenId = e.currentTarget.dataset.openid;
    console.log('选择好友，openid:', friendOpenId);
    wx.navigateTo({
      url: `/pages/chat/chat?chatUserId=${friendOpenId}`
    });
  },

  /**
   * 滚动到底部时加载更多好友
   */
  onScrollToLower: function() {
    console.log('滚动到底部，尝试加载更多好友');
    const { isLoading, isSearching, friends, totalCount } = this.data;
    if (isLoading || isSearching || friends.length >= totalCount) return; // 如果正在加载、在搜索或已加载全部好友，停止加载更多

    this.setData({
      isLoading: true
    }, () => {
      this.fetchFriendsWithUnreadCount();
    });
  },

  /**
   * 初始化消息监听，用于实时更新未读消息红点
   */
  initWatcher: function() {
    const that = this;
    const watcher = db.collection('messages')
      .where({
        toUserId: that.data.currentUserOpenId
      })
      .watch({
        onChange: async function(snapshot) {
          console.log('收到消息变化：', snapshot);
          // 处理消息变化
          snapshot.docChanges.forEach(async (change) => {
            const fromUserId = change.doc.fromUserId;
            if (change.type === 'add') {
              // 新增未读消息
              if (!change.doc.isRead) {
                // 更新好友列表中的 unreadCount
                const friendsIndex = that.data.friends.findIndex(friend => friend.openid === fromUserId);
                if (friendsIndex !== -1) {
                  const updatedFriends = [...that.data.friends];
                  updatedFriends[friendsIndex].unreadCount = (updatedFriends[friendsIndex].unreadCount || 0) + 1;
                  that.setData({
                    friends: updatedFriends
                  });
                }

                // 如果在搜索结果中也存在该好友，更新搜索结果中的 unreadCount
                const searchIndex = that.data.searchResults.findIndex(friend => friend.openid === fromUserId);
                if (searchIndex !== -1) {
                  const updatedSearchResults = [...that.data.searchResults];
                  updatedSearchResults[searchIndex].unreadCount = (updatedSearchResults[searchIndex].unreadCount || 0) + 1;
                  that.setData({
                    searchResults: updatedSearchResults
                  });
                }
              }
            } else if (change.type === 'update') {
              // 消息被标记为已读，重新获取对应好友的 unreadCount
              const newUnreadCount = await that.getUnreadCount(fromUserId);
              const friendsIndex = that.data.friends.findIndex(friend => friend.openid === fromUserId);
              if (friendsIndex !== -1) {
                const updatedFriends = [...that.data.friends];
                updatedFriends[friendsIndex].unreadCount = newUnreadCount;
                that.setData({
                  friends: updatedFriends
                });
              }

              // 如果在搜索结果中也存在该好友，更新搜索结果中的 unreadCount
              const searchIndex = that.data.searchResults.findIndex(friend => friend.openid === fromUserId);
              if (searchIndex !== -1) {
                const updatedSearchResults = [...that.data.searchResults];
                updatedSearchResults[searchIndex].unreadCount = newUnreadCount;
                that.setData({
                  searchResults: updatedSearchResults
                });
              }
            }
          });
        },
        onError: function(err) {
          console.error('监听消息失败', err);
          wx.showToast({
            title: '监听消息失败',
            icon: 'none'
          });
        }
      });
    that.setData({ watcher });
  },

});