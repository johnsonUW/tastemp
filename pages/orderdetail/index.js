// pages/orderdetail/index.js
import {
  $wuxDialog
} from '../../utils/components/wux.js';

let app = getApp();
const {
  V2_BASE_API,
  WECHAT_PAY
} = app;
const {
  submitPayOption
} = V2_BASE_API;
const LOCAL_VERIFY_CODE = app.globalData.localVerifyCode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    "payEnable": true
  },

  payOptions() {
    if (!(this.data.payEnable)) {
      return;
    }
    const orderId = wx.getStorageSync('latestOrderID');
    const userID = wx.getStorageSync('userID');

    let total_fee;

      let _this = this;
    $wuxDialog.open({

      content: '请选择支付方式',
      buttons: [{
        text: '取消'
      }, {
        text: '现金支付',
        type: 'weui-dialog__btn_primary',
        onTap(e) {
          $wuxDialog.prompt({
            content: '请输入验证码',
            fieldtype: 'digit',
            password: 0,
            defaultText: '',
            maxlength: 10,
            onConfirm(e) {
              const value = _this.data.$wux.dialog.prompt.response
              if (value === LOCAL_VERIFY_CODE) {
                submitPayOption(userID, orderId).then(res => {

                  wx.showToast({
                    title: `支付成功`,
                    icon: 'success',
                    duration: 1000
                  });
                  const {
                    havingDinner
                  } = app.globalData;
                  havingDinner.paid = true;
                  havingDinner.table = null;
                  havingDinner.dinnerTime = Date.now();
                  app.globalData.havingDinner = havingDinner;

                  wx.setStorageSync('havingDinner', havingDinner);
                  _this.setData({
                    payEnable: false
                  });
                  // wx.navigateTo({url: '../orderdetail/index'});
                }).catch(err => {

                  wx.showToast({
                    title: '支付失败',
                    icon: 'loading',
                    duration: 1000
                  });
                });
              } else {
                wx.showToast({
                  title: '验证码错误',
                  icon: 'loading'
                })
              }
            }
          })

        }
      }, {
        text: '微信支付',
        type: 'weui-dialog__btn_primary',
        onTap(e) {
          $wuxDialog.prompt({
            content: '请输入小费',
            fieldtype: 'digit',
            password: 0,
            defaultText: '',
            maxlength: 10,
            onConfirm(e) {
              const value = _this.data.$wux.dialog.prompt.response || 0
              WECHAT_PAY
                .initializePayment(app.globalData.userID, orderId, parseInt(value * 100))
                .then(res => {
                  const {
                    nonce,
                    paySign,
                    prepayId,
                    signType,
                    timeStamp,
                    totalAmountInPennies,
                    transactionId
                  } = res.data;
                  total_fee = totalAmountInPennies;
               
                  wx.requestPayment({
                    timeStamp: timeStamp,
                    nonceStr: nonce,
                    package: `prepay_id=${prepayId}`,
                    signType: signType,
                    paySign: paySign,
                    success: (res) => {

                      _this.setData({
                        selectedItemsLen: 0,
                        selectOrder: {
                          length: 0
                        }
                      });

                      const {
                        havingDinner
                      } = app.globalData;
                      havingDinner.paid = true;
                      havingDinner.table = true;
                      havingDinner.dinnerTime = Date.now();
                      app.globalData.havingDinner = havingDinner;
                      wx.setStorageSync('havingDinner', havingDinner);

                      wx.showToast({
                        title: `支付成功`,
                        icon: 'success',
                        duration: 1000
                      });
                      // wx.redirectTo({ url: '../orderdetail/index' });

                    },
                    fail: (res) => {

                      return Promise.reject(res)
                    }
                  })
                })
                .catch(err => {
                  if (err.data && err.data.errorCode === 401) {
                    wx.showToast({
                      title: `订单已支付`,
                      icon: `loading`,
                      duration: 1000
                    });
                    _this.setData({
                      payEnable: false
                    })
                  }
                });
            }

          })

        }
      }]
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbackNum: getCurrentPages().length - 1
    });
    let {
      latestOrder,
      userID,
      havingDinner
    } = app.globalData;
    this.setData({
      havingDinner,
      payEnable: !havingDinner.paid
    });
    if (!latestOrder) {
      return;
    }
    const {
      filterTime,
      details
    } = latestOrder;
    latestOrder.filterTime2Min = filterTime.substring(0, 5);
    let orderLen = 0;

    details.forEach(element => {
      orderLen += element.quantity;
    });

    latestOrder.orderLen = orderLen;

    this.setData({
      latestOrder
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
})