// pages/orderconfirm/index.js
import {
  $wuxDialog
} from '../../utils/components/wux.js';
import MD5 from '../../utils/plugins/md5.js';
let app = getApp();
const LOCAL_VERIFY_CODE = app.globalData.localVerifyCode;
const {
  V2_BASE_API,
  WECHAT_PAY
} = app;
const TAX_RATE = app.globalData.taxRate
const {
  getAnOrderInfo,
  getHistoryOrders,
  getMenu,
  getRestaurantInfo,
  getUserPreference,
  submitOrder,
  userLogin,
  submitPayOption,

} = V2_BASE_API;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toDetailEnable: true
  },
  goToDetailPage() {
    this.setData({
      toDetailEnable: false
    });
    app.globalData.latestOrder = this.data.latestOrder;
    wx.navigateTo({
      url: '../orderdetail/index',
      success: (res) => {
        this.setData({
          toDetailEnable: true
        })
      },
      fail: () => {
        this.setData({
          toDetailEnable: true
        })
      }
    })
  },

  payOptions() {
    if (app.globalData.havingDinner.paid) {
      wx.showToast({
        title: `请勿重复买单`,
        icon: `loading`,
        duration: 1000
      });
      return;
    };
    // getHistoryOrders(app.globalData.userID); const orderId =
    // "ocBa05PpjEOsY1-npqjvqJeP_Pdw 4/18/2018 4:06:21 AM";
    const orderId = wx.getStorageSync('latestOrderID');
    const userID = wx.getStorageSync('userID');

    let transaction_Id,
      total_fee,
      $notifyUrl;
    // const orderId = 'ocBa05PpjEOsY1-npqjvqJeP_Pdw 4/18/2018 6:41:53 AM';
    let _this = this;


    $wuxDialog.open({

      content: '请选择支付方式',
      buttons: [{
        text: '取消'
      }, {
        text: '现金支付',
        type: 'weui-dialog__btn_primary',
        onTap(e) {

          // 本地验证

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
                  const {
                    havingDinner
                  } = app.globalData;
                  havingDinner.table = null;
                  havingDinner.paid = true;
                  havingDinner.dinnerTime = Date.now();

                  app.globalData.havingDinner = havingDinner;
                  wx.setStorageSync('havingDinner', havingDinner);
                  _this.setData({
                    havingDinner
                  });
                  app.globalData.latestOrder = _this.data.latestOrder;
                  wx.navigateTo({
                    url: '../orderdetail/index'
                  });
                }).catch(err => {
                  wx.showToast({
                    title: '支付失败',
                    icon: 'loading',
                    duration: 1000
                  })
                });
                // console.log(value)
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
          // 提醒用户输入小费
          $wuxDialog.prompt({
            content: '请输入小费',
            fieldtype: 'digit',
            password: 0,
            defaultText: '',
            maxlength: 10,
            onConfirm(e) {
              const value = _this.data.$wux.dialog.prompt.response || 0
              WECHAT_PAY
                .initializePayment(app.globalData.userID, orderId, parseInt(value*100))
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

                      const {
                        havingDinner
                      } = app.globalData;
                      havingDinner.paid = true;
                      havingDinner.table = null;
                      havingDinner.dinnerTime = Date.now();
                      app.globalData.havingDinner = havingDinner;
                      wx.setStorageSync('havingDinner', havingDinner);

                      _this.setData({
                        selectedItemsLen: 0,
                        selectOrder: {
                          length: 0
                        },
                        havingDinner
                      });
                      app.globalData.latestOrder = _this.data.latestOrder;
                      wx.redirectTo({
                        url: '../orderdetail/index'
                      });

                    },
                    fail: (res) => {
                      return Promise.reject(res)
                    }
                  })

                })
                .catch(err => {});
            }
          })

          // wx.navigateTo({url: '../orderdetail/index'});
        }
      }]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getLocaleDateObj(i) {
    let _date = i.split('T');
    let _dateArr = _date[0].split('-');
    let _timeArr = _date[1].split('.')[0].split(':');
    let _timeZoneOff = new Date().getTimezoneOffset() * 60000;
    let k = new Date(Date.UTC(_dateArr[0], _dateArr[1] - 1, _dateArr[2], _timeArr[0], _timeArr[1], _timeArr[2]));
    const month = k.getMonth() + 1;
    const date = k.getDate();
    const hours = k.getHours();
    const minutes = k.getMinutes();
    const seconds = k.getSeconds();
    return {
      year: k.getFullYear(),
      month: month > 9 ?
        month : `0${month}`,
      date: date > 9 ?
        date : `0${date}`,
      hours: hours > 9 ?
        hours : `0${hours}`,
      minutes: minutes > 9 ?
        minutes : `0${minutes}`,
      seconds: seconds > 9 ?
        seconds : `0${seconds}`
    }
  },
  onLoad: function (options) {
    const menuInfo = wx.getStorageSync('menuInfo');
    const {
      restaurantID,
      userID,
      latestOrderId
    } = app.globalData;
    getAnOrderInfo({
      orderId: latestOrderId
    }).then(res => {
      let order = res.data;
      const {
        dateTime,
        details
      } = order;
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
      let latestOrderQuantity = 0;
      details.forEach(item => {
        const {
          cuisineId,
          dishId,
          quantity
        } = item;
        const _key = `r${restaurantID}c${cuisineId}d${dishId}`;
        const {
          price,
          name,
          image
        } = menuInfo[_key];
        latestOrderQuantity += quantity;
        oTotal += quantity * price;
        item.price = price;
        item.image = image;
        item.name = name;
      });
      
      order.taxFee = Math.round(oTotal * 100 * TAX_RATE) / 100;
      order.orderFee = Math.round(oTotal * 100) / 100;
      order.totalFee = Math.round(oTotal * 100 * (1 + TAX_RATE)) / 100;
      order.totalRmb = Math.round(order.totalFee * 100 * 6.3) / 100;
      order.filterDate = `${year}-${month}-${date}`;
      order.filterTime = `${hours}:${minutes}:${seconds}`;
      this.setData({
        latestOrder: order,
        latestOrderQuantity
      });
    }).catch(err => {});

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