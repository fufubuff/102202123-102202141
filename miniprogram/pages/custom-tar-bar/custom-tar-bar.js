Component({
  properties: {
    currentPage: {
      type: String,
      value: 'square' // 默认选中页
    }
  },
  methods: {
    navigateTo(event) {
      const page = event.currentTarget.dataset.page;
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      });
      this.triggerEvent('changePage', page); // 通知父组件
    }
  }
});

