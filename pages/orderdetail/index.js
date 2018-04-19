// pages/orderdetail/index.js
import {$wuxDialog} from '../../utils/components/wux.js';

let app = getApp();
const {V2_BASE_API, WECHAT_PAY} = app;
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
    "payEnable": true
  },

  payOptions() {
    if (!(this.data.payEnable)) {
      return;
    }
    const orderId = wx.getStorageSync('latestOrderID');
    const userID = wx.getStorageSync('userID');

    let transaction_Id,
      total_fee,
      $notifyUrl;
    // const orderId = 'ocBa05PpjEOsY1-npqjvqJeP_Pdw 4/18/2018 6:41:53 AM';
    let _this = this;
    $wuxDialog.open({

      content: '请选择支付方式',
      buttons: [
        {
          text: '取消'
        }, {
          text: '现金支付',
          type: 'weui-dialog__btn_primary',
          onTap(e) {
            submitPayOption(userID, orderId).then(res => {

              wx.showToast({title: `支付成功`, icon: 'success', duration: 1000});
              const {havingDinner} = app.globalData;
              havingDinner.paid = true;

              app.globalData.havingDinner = havingDinner;
              wx.setStorageSync('havingDinner', havingDinner);
              _this.setData({payEnable: false});
              // wx.navigateTo({url: '../orderdetail/index'});
            }).catch(err => {

              wx.showToast({title: '支付失败', icon: 'loading', duration: 1000});
            });

          }
        }, {
          text: '微信支付',
          type: 'weui-dialog__btn_primary',
          onTap(e) {
            WECHAT_PAY
              .initializePayment(app.globalData.userID, orderId)
              .then(res => {
                const {
                  nonce,
                  notifyUrl,
                  paySign,
                  prepayId,
                  signType,
                  timeStamp,
                  totalAmountInPennies,
                  transactionId
                } = res.data;
                total_fee = totalAmountInPennies;
                transaction_Id = transactionId;
                $notifyUrl = notifyUrl;
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

                    const {havingDinner} = app.globalData;
                    havingDinner.paid = true;

                    app.globalData.havingDinner = havingDinner;
                    wx.setStorageSync('havingDinner', havingDinner);

                    wx.showToast({title: `支付成功`, icon: 'success', duration: 1000});
                    // wx.redirectTo({ url: '../orderdetail/index' });

                  },
                  fail: (res) => {

                    return Promise.reject(res)
                  }
                })
              })
              .catch(err => {
                if (err.data && err.data.errorCode === 401) {
                  wx.showToast({title: `订单已支付`, icon: `loading`, duration: 1000});
                  _this.setData({payEnable: false})
                }
              });
            // wx.navigateTo({url: '../orderdetail/index'});
          }
        }
      ]
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navbackNum: getCurrentPages().length - 1
    });
    let {latestOrder, userID, havingDinner} = app.globalData;
    this.setData({havingDinner,payEnable: !havingDinner.paid && havingDinner.status});
    if(!latestOrder){
      return;
    }
    const {filterTime, details} = latestOrder;
    latestOrder.filterTime2Min = filterTime.substring(0, 5);
    let orderLen = 0;

    details.forEach(element => {
      orderLen += element.quantity;
    });

    latestOrder.orderLen = orderLen;

    this.setData({latestOrder});
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {}

})