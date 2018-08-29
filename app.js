//app.js

import {V2_BASE_API, WECHAT_PAY} from './utils/order_api_v2/index.js';

const EXPIRED_TIME = 3600000; //订单超时时间  1000 * 60 * 60
const CODE_EXPIRED = 180000 // 扫码超时时间 1000 * 60 * 3; /* deprecated */

const {userLogin} = V2_BASE_API;

App({
  V2_BASE_API,
  WECHAT_PAY,

  haveDinner: function () {

    /**
    * 用于判断当前用户是否在用餐,
    *
    */

    let havingDinner = wx.getStorageSync('havingDinner') || {
      'status': false,
      'dinnerTime': 0,
      'table': null,
      'paid': false
    };

    const _now = Date.now();

    if (_now > havingDinner.dinnerTime + EXPIRED_TIME) {
      havingDinner = {
        'status': false,
        'dinnerTime': 0,
        'table': null,
        'paid': false
      }
    };

    this.globalData.havingDinner = havingDinner;
    wx.setStorageSync('havingDinner', havingDinner);
  },

  getUserID: function () {
    const USER_ID = wx.getStorageSync('userID') || '';
    this.globalData.userID = USER_ID;

    if (USER_ID) {} else {

      wx.login({
        success: (res) => {

          if (res.code) {;
            userLogin(res.code).then(res => {

              this.globalData.userID = res.data;
              wx.setStorageSync('userID', res.data);
            }).catch(err => {});

          }
        },
        fail: () => {
          // fail
        }
      })
    }
  },
  onLaunch: function (options) {
    this.haveDinner();
    /* const timeNow = Date.now();

    let {id: restaurantID} = options.query;

    this.haveDinner();
    if (restaurantID) {
      this.globalData.restaurantID = restaurantID;
      wx.setStorageSync('restaurantID', restaurantID);
      this.getUserID();
    } else {
      wx.setStorageSync('restaurantID', '');
      wx.showModal({
        content: `请扫描餐桌上的二维码点餐`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack({delta: 1})
          }
        }
      })
    }; */
  },

  onShow: function (options) {
    /* deprecated */
    let {id: restaurantID, tableNumber} = options.query;
    if (restaurantID) {
      /* 扫码进入 */
      tableNumber = typeof tableNumber !== 'undefined' ? parseInt(tableNumber, 10) : 0

      this.globalData.restaurantID = restaurantID;
      wx.setStorageSync('restaurantID', restaurantID);
      this.globalData.tableNumber = tableNumber;
      wx.setStorageSync('tableNumber', tableNumber);
      wx.setStorageSync('codeExpired', Date.now());
      this.getUserID();
    } else {
      // 每次进入小程序都需要扫码进入
      /* wx.setStorageSync('restaurantID', '');
      wx.showModal({
        content: `请扫描餐桌上的二维码点餐`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack({delta: 1})
          }
        }
      }) */

      // 扫码进入小程序后, 3分钟内可以不通过扫码进入, 进入的时候会刷新这个状态
      let _codeNow = Date.now();
      // 判断当前二维码的有效时间是否超时
      let _codeBefore = wx.getStorageSync('codeExpired') || 0;

      if (_codeNow > _codeBefore + CODE_EXPIRED) {
        wx.setStorageSync('restaurantID', '');
        wx.setStorageSync('tableNumber', 0);
        wx.showModal({
          content: `请扫描餐桌上的二维码点餐`,
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack({delta: 1})
            }
          }
        })
      } else {
        // 未扫码进入, 但是距离上一次打开小程序不到5分钟
        restaurantID = wx.getStorageSync('restaurantID');
        this.globalData.restaurantID = restaurantID;
        tableNumber = parseInt(wx.getStorageSync('tableNumber'), 10);
        this.globalData.tableNumber = tableNumber;
        wx.setStorageSync('codeExpired', _codeNow);
        this.haveDinner();
        this.getUserID();
      }
    }
  },
  globalData: {
    userInfo: null,
    imgRatio: '@2x',
    taxRate: 0.0925,
    localVerifyCode: '1234',
    delOrderPWD: 'tastymenuadmin'
  }
})