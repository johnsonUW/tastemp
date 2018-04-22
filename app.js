//app.js

import {V2_BASE_API, WECHAT_PAY} from './utils/order_api_v2/index.js';

const EXPIRED_TIME = 3600000; //订单超时时间  1000 * 60 * 60
const CODE_EXPIRED = 18000000 // 扫码超时时间 1000 * 60 * 60 * 6;

const {userLogin} = V2_BASE_API;

App({
  V2_BASE_API,
  WECHAT_PAY,

  haveDinner: function () {

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
    const timeNow = Date.now();

    let {id: restaurantID = 1} = options.query;

    this.haveDinner();
    if (restaurantID) {
      this.globalData.restaurantID = restaurantID;
      wx.setStorageSync('restaurantID', restaurantID);
      this.getUserID();
    };
  },

  onShow: function (options) {
    let {id: restaurantID = 1} = options.query;

    if (restaurantID) {
      /* 扫码进入 */
      wx.setStorageSync('codeExpired', Date.now());
     
      this.haveDinner();
      this.getUserID();
    } else {
      /* 未扫码进入 */
      let _codeNow = Date.now();
      /* 判断当前二维码的有效时间是否超时 */
      let _codeBefore = wx.getStorageSync('codeExpired') || 0;
      if (_codeNow > _codeBefore + CODE_EXPIRED) {
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
        /* 未扫码进入, 但是距离上一次扫码不到五个小时 */
        restaurantID = wx.getStorageSync('restaurantID');
        this.globalData.restaurantID = restaurantID;
        
        this.haveDinner();
        this.getUserID();
      }
    }
  },
  globalData: {
    userInfo: null,
    imgRatio: '@2x'
  }
})