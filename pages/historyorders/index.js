// pages/historyorders/index.js
let app = getApp();
const {V2_BASE_API} = app;
const {
  getAnOrderInfo,
  getHistoryOrders,
  getMenu,
  getRestaurantInfo,
  getUserPreference,
  submitOrder,
  userLogin,
  submitPayOption
} = V2_BASE_API;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex: 6
  },
  toLatestOrderDetail() {
    const {latestOrder} = this.data;
    app.globalData.latestOrder = latestOrder;
  },

  getLocaleDateObj(i) {
    let _date = i.split('T');
    let _dateArr = _date[0].split('-');
    let _timeArr = _date[1].split('.')[0].split(':');
    let _timeZoneOff =new Date().getTimezoneOffset() * 60000;
    let k = new Date(Date.UTC( _dateArr[0],_dateArr[1]-1,_dateArr[2],_timeArr[0],_timeArr[1],_timeArr[2]));
    const month = k.getMonth() + 1;
    const date = k.getDate();
    const hours = k.getHours();
    const minutes = k.getMinutes();
    const seconds = k.getSeconds();
    return {
      year: k.getFullYear(),
      month: month > 9
        ? month
        : `0${month}`,
      date: date > 9
        ? date
        : `0${date}`,
      hours: hours > 9
        ? hours
        : `0${hours}`,
      minutes: minutes > 9
        ? minutes
        : `0${minutes}`,
      seconds: seconds > 9
        ? seconds
        : `0${seconds}`
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {restaurantID, userID, havingDinner} = app.globalData;
    const menuInfo = wx.getStorageSync('menuInfo');

    this.setData({
      navbackNum: getCurrentPages().length - 1,
      havingDinner
    });

    getHistoryOrders(userID, restaurantID).then(res => {
      let historyOrders = res.data;
      historyOrders.forEach(order => {
        const {dateTime, details} = order;
        // const dateArr = dateTime.split('T');
        const dateObj = this.getLocaleDateObj(dateTime);
        const {
          year,
          month,
          date,
          hours,
          minutes,
          seconds
        } = dateObj;

        // const dateArr = dateTime.split('T'); const timeArr = dateArr[1]
        // .split('.')[0]   .split(':');
        let oTotal = 0;

        details.forEach(item => {
          const {cuisineId, dishId, quantity} = item;
          const _key = `r${restaurantID}c${cuisineId}d${dishId}`;
          const {price, name, image} = menuInfo[_key];
          oTotal += quantity * price;
          item.price = price;
          item.image = image;
          item.name = name;
        });
        order.totalFee = Math.round(oTotal * 100) / 100;
        order.filterDate = `${year}-${month}-${date}`;
        order.filterTime = `${hours}:${minutes}:${seconds}`;
      });
      historyOrders.sort((a, b) => (new Date(b.dateTime) - new Date(a.dateTime)));

      this.setData({historyOrders, latestOrder: historyOrders[0], showIndex: 6})

    }).catch(err => {})

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
  onReachBottom: function () {
    let {showIndex} = this.data;
    this.setData({
      showIndex: showIndex += 6
    })
  }
})