// pages/friends/friends.js
const app = getApp(); 
const db = wx.cloud.database();

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
    // totalCount: 0,        // 总用户数量（如果未获取到总数，可暂时注释）
    currentOpenId: '',    // 当前用户的 openid
  },

  onLoad: function() {
    this.getOpenId().then(openid => {
      this.setData({ currentOpenId: openid });
      console.log('当前用户的 openid:', openid);
      this.fetchFriends(openid); // 获取所有好友
    }).catch(err => {
      console.error('获取 openid 失败:', err);
      wx.showToast({
        title: '获取用户信息失败，请稍后再试',
        icon: 'none'
      });
    });
  },

  /**
   * 调用云函数 'login' 获取 openid
   */
  getOpenId: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          if (res.result && res.result.openid) {
            console.log('获取到 openid:', res.result.openid);
            resolve(res.result.openid);
          } else {
            console.error('未获取到 openid:', res);
            reject('未获取到 openid');
          }
        },
        fail: err => {
          console.error('云函数 [login] 调用失败：', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 获取全部好友，支持分页
   */
  fetchFriends: function(openid) {
    const that = this;
    const { pageSize, currentPage } = this.data;
    db.collection('users')
      .where({
        openid: db.command.neq(openid) // 排除当前用户
      })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .get({
        success: function(res) {
          console.log('获取到的好友列表数据：', res.data);
          const newFriends = that.data.friends.concat(res.data);
          that.setData({
            friends: newFriends,
            currentPage: that.data.currentPage + 1,
            // totalCount: res.stats.total // 如果 res.stats.total 未定义，可暂时注释掉
          });
        },
        fail: function(err) {
          console.error('获取好友列表失败：', err);
          wx.showToast({
            title: '获取好友列表失败',
            icon: 'none'
          });
        }
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

    const that = this;

    // 使用正则表达式进行模糊搜索
    db.collection('users')
      .where({
        nickname: db.RegExp({
          regexp: keyword,
          options: 'i' // 不区分大小写
        })
      })
      .get({
        success: function(res) {
          console.log('搜索结果：', res.data);
          const results = res.data.map(user => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            const highlightedNickname = user.nickname.replace(regex, '<span>$1</span>');
            return {
              ...user,
              highlightedNickname
            };
          });
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
    console.log(`头像加载错误，索引: ${index}`);
    const type = this.data.isSearching ? 'searchResults' : 'friends';
    const list = this.data[type];

    if (list[index]) {
      list[index].avatarUrl = 'cloud://fufubuff-3gt0b01y042179cc.6675-fufubuff-3gt0b01y042179cc-1330048678/images/default-avatar.jpg'; // 确保您有一张默认头像图片
      this.setData({
        [type]: list
      });
    }
  },

  /**
   * 选择好友，进入聊天界面
   */
  onSelectFriend: function(e) {
    const openid = e.currentTarget.dataset.openid;
    console.log('选择好友，openid:', openid);
    wx.navigateTo({
      url: `/pages/chat/chat?chatUserId=${openid}`
    });
  },

  /**
   * 滚动到底部时加载更多好友
   */
  onScrollToLower: function() {
    console.log('滚动到底部，尝试加载更多好友');
    const { friends, isLoading, isSearching } = this.data;
    if (isLoading || isSearching) return; // 如果正在加载或在搜索，停止加载更多

    this.setData({
      isLoading: true
    }, () => {
      this.fetchFriends(this.data.currentOpenId);
      this.setData({
        isLoading: false
      });
    });
  }
});
