// pages/list/list.js
import {
  isMatch,
  cloneDeep
} from '../../utils/plugins/lodash/index.js';

let app = getApp();
let testAPI = app.testAPI;
/* deprecated */
// const {account, company, menu, order, V2_BASE_API} = app;
const {
  V2_BASE_API
} = app;

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

// import Tlist from '../../utils/mock.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedItems: {
      length: 0
    },
    selectedItemsLen: 0,
    imgRatio: app.globalData.imgRatio,
    selectedItem: {
      "name": "卤肉饭大份",
      "price": "36.99",
      "number": 1,
      "des": ""
    },
    activeIndex: 0,
    listData: [],
    mScrollTop: 0,
    cartDetailShow: false,
    animateCSS: '',
    cartScrollY: false,
    showSelectedItem: false,
    showTableNum: false,
    onlineOrders: [],
    onlineOrdersID: [],
    confirmTableNumEnable: true,
    hotKeyIndex: [],
    hotIndex: {},
    restaurantInfo: {},
    tableNumber: null,
    totalFee: 0
  },

  blank() {
    return;
  },

  hideAll() {
    this.setData({
      cartDetailShow: false,
      showSelectedItem: false,
      showPreferences: false,
      showTableNum: false
    })
  },

  /**
   * 唤起item的详情页
   *
   * @param {any} e
   */
  showItemDetail(e) {
    const {
      cateindex,
      subindex
    } = e.currentTarget.dataset;
    this.setData({
      showSelectedItem: true,
      selectedItem: this.data.listData[cateindex].items[subindex],
      cateindex,
      subindex
    })
  },

  switchPreferences(e) {
    const index = e.target.dataset.index;

    index !== undefined && this.setData({
      'selectedIndex': index,
      selectQuantity: 1
    })
  },
  decreasePFQuan() {
    let selectQuantity = this.data.selectQuantity;
    if (selectQuantity < 2) {
      this.calcTotalFee();
      return
    } else {
      this.setData({
        'selectQuantity': --selectQuantity
      })
    }
    this.calcTotalFee();
  },
  increasePFQuan() {
    let selectQuantity = this.data.selectQuantity;
    this.setData({
      'selectQuantity': ++selectQuantity
    });
    this.calcTotalFee();
  },
  addPF2Cart() {
    const {
      selectQuantity,
      selectedPrefer,
      selectedIndex,
      pfCateIndex,
      pfSubindex,
      selectedItemsLen,
      companyId
    } = this.data;
    const {
      name,
      id
    } = selectedPrefer;
    const key = `c${name || ''}id${id}pf${selectedIndex}`;

    let selectedItems = this.data.selectedItems;

    // 比较待选中的和已经选中的
    let selectedItem = selectedItems[key];
    if (selectedItem) {
      // 如果之前已经选择了, 直接把quantity++就可以了:
      let {
        quantity
      } = this.data.listData[pfCateIndex].items[pfSubindex];
      this.setData({
        [`selectedItems.${key}.quantity`]: selectQuantity + quantity,
        selectedItemsLen: selectQuantity + selectedItemsLen,
        [`listData[${pfCateIndex}].items[${pfSubindex}].quantity`]: selectQuantity + quantity
      })

    } else {
      // 如果之前没有选择:
      let length = selectedItems.length;
      this.setData({
        [`selectedItems.${key}`]: {
          quantity: selectQuantity,
          item: selectedPrefer,
          preferences: [selectedPrefer.preferences[selectedIndex]],
          id: parseInt(companyId),
          cateindex: pfCateIndex,
          subindex: pfSubindex
        },
        [`selectedItems.length`]: selectQuantity + length,
        selectedItemsLen: selectQuantity + selectedItemsLen,
        [`listData[${pfCateIndex}].items[${pfSubindex}].quantity`]: selectQuantity,
        [`listData[${pfCateIndex}].items[${pfSubindex}].pref`]: `pf${selectedIndex}`
      })
    }

    /* 修改逻辑 => 每一个菜只能选择一个口味, 通过pref属性判断, 选中了就有这个属性 */
    this.calcTotalFee();
    this.hideAll();
  },

  // sync the hot & normal menu;
  syncHotMenu(ele, target) {
    if (ele) {
      const {
        hotIndex,
        hotSubIndex,
        norIndex,
        norSubIndex
      } = ele;
      let quantity;
      switch (target) {
        case 'hot':
          // update normal too;
          quantity = this.data.listData[hotIndex].items[hotSubIndex].quantity;
          this.setData({
            [`listData[${norIndex}].items[${norSubIndex}].quantity`]: quantity
          });
          break;
        case 'normal':
          quantity = this.data.listData[norIndex].items[norSubIndex].quantity;
          // update hot too;
          this.setData({
            [`listData[${hotIndex}].items[${hotSubIndex}].quantity`]: quantity
          });
          break;

        default:
          break;
      }
    }
  },
  addToCart(e) {
    let {
      selectedItemsLen,
      companyId,
      hotIndex,
      hotKeyIndex
    } = this.data;
    this.hideAll();

    const {
      cateindex,
      subindex,
      target
    } = e.currentTarget.dataset;
    let selectedPrefer = this.data.listData[cateindex].items[subindex],
      preferences = selectedPrefer.preferences;

    // deprecated
    if (preferences && preferences.length > 1) {
      // 有额外选项
      this.setData({
        'showPreferences': true,
        "selectedPrefer": selectedPrefer,
        selectedIndex: 0,
        selectQuantity: 1,
        pfCateIndex: cateindex,
        pfSubindex: subindex
      })
    } else {
      // 没有额外选项, 直接添加到菜单
      const element = this.data.listData[cateindex].items[subindex];
      const {
        cuisineId: name,
        id: id
      } = element;
      const key = `c${name || ''}id${id}`;

      //
      const _eleHotIndex = hotIndex[key];

      let selectedItems = this.data.selectedItems;

      // 比较待选中的和已经选中的
      let selectedItem = selectedItems[key];
      if (selectedItem) {
        // 如果之前已经选择了, 直接把quantity++就可以了:cart isn't Empty
        let {
          quantity
        } = selectedItems[key];
        this.setData({
          [`selectedItems.${key}.quantity`]: ++quantity,
          selectedItemsLen: ++selectedItemsLen,
          [`listData[${cateindex}].items[${subindex}].quantity`]: 1
        })

      } else {
        // 如果之前没有选择: cart is Empty
        let length = selectedItems.length;
        this.setData({
          [`selectedItems.${key}`]: {
            quantity: 1,
            item: element,
            preferences: [],
            id: parseInt(companyId),
            cateindex,
            subindex
          },
          [`selectedItems.length`]: ++length,
          selectedItemsLen: ++selectedItemsLen,
          [`listData[${cateindex}].items[${subindex}].quantity`]: 1
        })
        this.syncHotMenu(_eleHotIndex, target);
      }
    }
    this.calcTotalFee();
  },

  showTableNum(e) {
    // 如果处于正在用餐的状态, 直接上传订单;
    const {
      paid,
      status,
      dinnerTime,
      table
    } = this.data.havingDinner;

    if (status && table) {
      this.confirmTableNum();
    } else {
      this.setData({
        showTableNum: true,
        tableNumber: null
      });
    }
  },
  hideTableNum(e) {
    this.setData({
      showTableNum: false
    })
  },

  getTableNumber(e) {
    const {
      value
    } = e.detail;

    this.setData({
      tableNumber: parseInt(value)
    })
  },
  /**
   * get the tableNumber & upload order
   *
   * @param {any} e
   */

  confirmTableNum(e) {
    const {
      tableNumber,
      restaurantInfo,
      selectedItems
    } = this.data;
    const {
      userID
    } = app.globalData;
    const {
      id: restaurantID,
      name: restaurantName
    } = restaurantInfo;
    let details = [];

    if (!tableNumber) {
      wx.showToast({
        title: `请输入餐桌号`,
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    this.setData({
      confirmTableNumEnable: false
    })
    wx.showLoading({
      title: "下单中...",
      mask: true
    });

    Object
      .keys(selectedItems)
      .forEach(_key => {
        if (_key === "length") {
          return;
        };
        const tempEle = selectedItems[_key];
        details.push({
          "dishId": tempEle.item.id,
          "quantity": tempEle.quantity,
          "cuisineId": tempEle.item.cuisineId
        });
      })
    let confirmData = {
      "restaurantId": restaurantID,
      "userId": userID,
      "items": details,
      "table": tableNumber
    };
    submitOrder(confirmData).then(res => {
      wx.hideLoading();

      const havingDinner = {
        'status': true,
        'dinnerTime': Date.now(),
        'table': parseInt(tableNumber),
        'paid': false
      };

      app.globalData.havingDinner = havingDinner;
      wx.setStorageSync('havingDinner', havingDinner);

      this.setData({
        confirmTableNumEnable: true,
        tableNumber: parseInt(tableNumber),
        havingDinner
      });
      app.globalData.latestOrderId = res.data;

      wx.setStorageSync('latestOrderID', res.data);
      this.clearSelectedItems();
      wx.navigateTo({
        url: '../orderconfirm/index'
      });
    }).catch(err => {
   
      
      wx.hideLoading();
      this.setData({
        confirmTableNumEnable: true
      });
      wx.showToast({
        title: `下单失败`,
        icon: 'loading',
        "duration": 1000
      });
    });

    // TODO: upload the order setTimeout(() => {   wx.hideLoading(); this.setData({
    // confirmTableNumEnable:true   })   wx.navigateTo({     url:
    // '../orderconfirm/index'   }) }, 1000); this.setData({"confirmTableNumEnable":
    // false})
  },

  getCartDetail(e) {
    if (!this.data.cartDetailShow) {
      this.hideAll();
    }
    this.data.cartDetailShow = !this.data.cartDetailShow
    let animateCSS;
    if (this.data.cartDetailShow) {
      animateCSS = `weui-animate-slide-up weui-animate-fade-int`
    } else {
      animateCSS = `weui-animate-slide-down weui-animate-fade-out`
    }
    this.setData({
      animateCSS: animateCSS,
      cartDetailShow: this.data.cartDetailShow
    });
  },

  // Clear the cart
  clearSelectedItems(e) {

    const {
      selectedItems,
      hotIndex
    } = this.data;
    Object
      .keys(selectedItems)
      .forEach(_key => {
        if (_key === 'length') {
          return
        }
        const {
          cateindex,
          subindex,
          item
        } = selectedItems[_key];
        this.setData({
          [`listData[${cateindex}].items[${subindex}].quantity`]: 0
        });

        const _eleHotIndex = hotIndex[_key];

        this.syncHotMenu(_eleHotIndex, item.target);
      });

    this.setData({
      selectedItems: {
        length: 0
      },
      selectedItemsLen: 0
    });
    this.hideAll();
    this.calcTotalFee();
  },

  increaseNum(e) {
    let {
      index,
      close,
      cateindex,
      subindex,
      src,
      target
    } = e.currentTarget.dataset;
    if (close) {
      this.setData({
        showSelectedItem: false
      })
    }
    let tempSelecEle = this.data.listData[cateindex].items[subindex];
    if (src !== 'cart') {
      index += tempSelecEle.pref || '';
    }
    if (tempSelecEle.preferences && tempSelecEle.preferences.length > 1 && src !== 'cart' && tempSelecEle.quantity === 0) {
      this.setData({
        showPreferences: true
      })
      return;
    }
    let {
      quantity
    } = this.data.selectedItems[index];
    let {
      selectedItemsLen,
      hotIndex
    } = this.data;
    if (quantity === 0) {
      return;
    }
    quantity = ++quantity;
    this.setData({
      [`selectedItems.${index}.quantity`]: quantity,
      selectedItemsLen: ++selectedItemsLen,
      [`listData[${cateindex}].items[${subindex}].quantity`]: quantity
    })
    const _eleHotIndex = hotIndex[index]
    this.syncHotMenu(_eleHotIndex, target);
    this.calcTotalFee();
  },
  decreaseNum(e) {
    
    let {
      index,
      close,
      cateindex,
      subindex,
      src,
      target
    } = e.currentTarget.dataset;
    if (close) {
      this.setData({
        showSelectedItem: false
      })
    }
    let tempSelecEle = this.data.listData[cateindex].items[subindex];
    // if(this.data.listData[cateindex].items[subindex].preferences.length > 1 &&
    // src !== 'cart'){   wx.showToast({     title:'请从购物车删除',     icon: 'loading',
    // mask: true,     duration: 1000   })   return; }
    if (src !== 'cart') {
      index += tempSelecEle.pref || '';
    }
    let {
      quantity
    } = this.data.selectedItems[index];
    let {
      selectedItemsLen,
      hotIndex
    } = this.data;
    quantity = --quantity;
    const _eleHotIndex = hotIndex[index]

    /* 数量变成0需要的操作 */
    if (quantity === 0) {
      
      let {
        selectedItems,
        onlineOrders,
        onlineOrdersID
      } = this.data;
      let {
        id: itemID
      } = selectedItems[index].item;
      const orderItemIDFlag = onlineOrdersID.indexOf(itemID);
      if (orderItemIDFlag !== -1) {
        const orderItemID = onlineOrders[orderItemIDFlag].id;
        order
          .deleteOrderItem(orderItemID, app.globalData.token)
          .then(res => {
            onlineOrdersID.splice(orderItemIDFlag, 1);
            onlineOrders.splice(orderItemIDFlag, 1)

            delete(selectedItems[index]);
            let {
              length
            } = selectedItems;
            selectedItems.length = --length;
            this.setData({
              selectedItems: selectedItems,
              selectedItemsLen: --selectedItemsLen,
              [`listData[${cateindex}].items[${subindex}].quantity`]: quantity,
              [`listData[${cateindex}].items[${subindex}].pref`]: ``,
              onlineOrders,
              onlineOrdersID
            });
            this.calcTotalFee();
            this.syncHotMenu(_eleHotIndex, target);
          })
          .catch(res => {})

      } else {

        delete(selectedItems[index]);
        let {
          length
        } = selectedItems;
        selectedItems.length = --length;
        this.setData({
          selectedItems: selectedItems,
          selectedItemsLen: --selectedItemsLen,
          [`listData[${cateindex}].items[${subindex}].quantity`]: quantity,
          [`listData[${cateindex}].items[${subindex}].pref`]: ``
        })
        this.calcTotalFee();
        this.syncHotMenu(_eleHotIndex, target);
      }
      return;
    } else {
      this.setData({
        [`selectedItems.${index}.quantity`]: quantity,
        selectedItemsLen: --selectedItemsLen,
        [`listData[${cateindex}].items[${subindex}].quantity`]: quantity
      });
      this.syncHotMenu(_eleHotIndex, target);
    }
    this.calcTotalFee();
  },

  calcTotalFee() {
    
    const {
      selectedItems
    } = this.data;
    let totalFee = 0;
    Object
      .keys(selectedItems)
      .forEach(_key => {
        if (_key === 'length') {
          return;
        };
        const {
          quantity,
          item
        } = selectedItems[_key];
        const {
          price
        } = item;
        totalFee += price * 100 * quantity;
      });
    this.setData({
      totalFee
    });
  },

  /* Scroll-view's method start */
  itemsScroll(e) {
    /* 20180520 deprecated*/
    return
    const {
      itemsViewH,
      menuViewH,
      menuScrollH,
      menuItemH,
      tapIndex
    } = this.data;
    if (!menuScrollH) {

      let query = wx.createSelectorQuery();
      // query.select('.menu-scroll').boundingClientRect();
      // query.select('.items-scroll').boundingClientRect();
      query
        .select('#m0')
        .boundingClientRect();

      query.exec(res => {
        this.setData({
          menuScrollH: res[0].height * this.data.listData.length,
          menuItemH: res[0].height
        })

      })
    }

    // let menuScrollH =
    const {
      scrollTop,
      scrollHeight
    } = e.detail;

    let topArr = []; //用于记录scrollview中节点的top位置

    let flag;
    let query = wx.createSelectorQuery();
    this
      .data
      .listData
      .forEach((value, i, arr) => {

        let temp = query.select(`#i${i}`);
        // i.scrollOffset(res => {   console.log(res) });
        temp.boundingClientRect();
      })

    query.exec((res) => {
      let i = 0;
      while (i < res.length) {

        if ((i + 1) === res.length || res[i + 1].top > 1) {
          let queryM = wx.createSelectorQuery();
          queryM
            .select(`#m${i}`)
            .boundingClientRect();
          queryM.exec(res => {
            let item = res[0];
            if (item.top < 0 || item.top >= (menuViewH - menuItemH)) {
              let tempScrollTop = scrollTop / (scrollHeight - itemsViewH) * (menuScrollH - menuViewH);
              if (i === this.data.listData.length - 1) {
                tempScrollTop = menuScrollH;
              } else if (i === 0) {
                tempScrollTop = 0
              }
              this.setData({
                mScrollTop: tempScrollTop
              })

            }
          })
          this.setData({
            activeIndex: i
          });
          this.setData({
            activeIndex: tapIndex
          });

          break;
        }
        i++
      }

      // this.setData({   activeIndex:flagIndex })
    })

    // console.log(flagIndex, 'flag') console.log(topArr, topArr.length, typeof
    // topArr, Array.isArray(topArr))
  },
  selectCategory(e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    this.setData({
      intoView: id,
      tapIndex: index
    });
  },
  /* Scroll-view's method end */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const {
      restaurantID
    } = app.globalData;
    getRestaurantInfo(restaurantID).then(res => {
      const {
        name
      } = res.data;
      this.setData({
        restaurantInfo: res.data
      });
      wx.setStorageSync('restaurantInfo', res.data);
      wx.setNavigationBarTitle({
        title: name || ""
      });
    }).catch(err => {});

    const {
      havingDinner
    } = app.globalData;
    const {
      status,
      table
    } = havingDinner;

    const RESTAURANT_ID = parseInt(restaurantID);
    this.setData({
      restaurantID: RESTAURANT_ID,
      havingDinner,
      tableNumber: table,
      tapIndex: 0
    });

    let userIDInterval = null;

    userIDInterval = setInterval(() => {
      if (app.globalData.userID) {
        const {
          userID: USER_ID
        } = app.globalData;
        let promArr = [
          getUserPreference(USER_ID, RESTAURANT_ID),
          getMenu(RESTAURANT_ID)
        ];
        Promise
          .all(promArr)
          .then(res => {

            let listData = [];
            let hotKeyIndex = []; //use to store the key of hot dishes
            let hotIndex = {}; //use to store the index from hot dishes & normal dishes
            res.forEach((ele, index) => {
              if (index === 0) {
                let dishes = ele.data;

                let filterDishes = []; // use to store the match dishes

                Array.isArray(dishes) && dishes.forEach((hotEle, index) => {

                  const {
                    cuisineId,
                    id,
                    restaurantId
                  } = hotEle;
                  if (restaurantId !== RESTAURANT_ID) {
                    return;
                  };
                  hotEle.isHot = true;
                  hotEle.target = 'hot';
                  const _KEY = `c${cuisineId}id${id}`;
                  
                  if (hotKeyIndex.indexOf(_KEY) !== -1) {
                    return
                  }
                  hotIndex[_KEY] = {
                    hotIndex: 0,
                    hotSubIndex: filterDishes.length
                  }
                  filterDishes.push(hotEle)
                  hotKeyIndex.push(_KEY);
                });

                if (filterDishes.length > 0) {
                  listData.push({
                    "cuisine": {
                      "name": "热销",
                      id: ""
                    },
                    "items": filterDishes
                  })
                }
              } else {
                if (hotKeyIndex.length > 0) {
                  this.setData({
                    hotKeyIndex
                  })
                }
                listData.push(...ele.data);
                wx.setStorageSync('menu', ele.data);

                this.setData({
                  listData
                });

                // hot menu is avaliable
                if (hotKeyIndex.length > 0) {
                  let hotFlag = 0;
                  listData.some((goodsEle, gIndex) => {
                    if (gIndex === 0) {
                      return;
                    }
                    return goodsEle
                      .items
                      .some((foodEle, fIndex) => {

                        const _KEY = `c${foodEle.cuisineId}id${foodEle.id}`;
                        // if()
                        if (hotKeyIndex.indexOf(_KEY) !== -1) {
                          ++hotFlag;
                          // This food in the hot menu
                          foodEle.isHot = true;
                          foodEle.target = 'normal';
                          hotIndex[_KEY].norIndex = gIndex;
                          hotIndex[_KEY].norSubIndex = fIndex;

                          if (hotFlag === hotKeyIndex.length) {
                            return true
                          }

                        }
                      })
                  })
                }

                let menuInfo = {};
                ele
                  .data
                  .forEach(res => {
                    res
                      .items
                      .forEach(item => {
                        const {
                          cuisineId,
                          id,
                          quantity
                        } = item;
                        const _key = `r${restaurantID}c${cuisineId}d${id}`;
                        menuInfo[_key] = item;
                      });
                  });
                wx.setStorageSync('menuInfo', menuInfo);
              }
            })
            this.setData({
              listData,
              hotIndex,
              hotKeyIndex
            });
          })
          .catch(err => {});
        clearInterval(userIDInterval);
        userIDInterval = null;

      } else {
        return;
      };
    }, 160);

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(Tlist)
    this.setData({
      havingDinner: app.globalData.havingDinner
    })


    /* 20180520 deprecated*/
    // let query = wx.createSelectorQuery();
    // query
    //   .select('.menu-scroll')
    //   .boundingClientRect();
    // query
    //   .select('.items-scroll')
    //   .boundingClientRect();
    // // query.select('#m0').boundingClientRect();

    // query.exec(res => {
    //   this.setData({menuViewH: res[0].height, itemsViewH: res[1].height})
    //   // menuScrollH: res[2].height * this.data.listData.length, menuItemH:
    //   // res[2].height
    // })
    /* 20180520 deprecated*/

    /* V2 deprecated */
    /*
    const {selectedItems, selectedItemsLen} = app.globalData;

    if (selectedItems && (selectedItems.length || selectedItems.length === 0)) {

      Object
        .keys(selectedItems)
        .forEach(res => {
          if (res === 'length') {
            return
          }
          const {cateindex, subindex, quantity} = selectedItems[res];
          this.data.listData[cateindex].items[subindex].quantity = quantity
        })
      this.setData({listData: this.data.listData, selectedItemsLen, selectedItems})
    } */

    // const uploadOrders = wx.getStorageSync('uploadOrders'); const
    // uploadOrdersFlag = uploadOrders.items && uploadOrders   .items   .some(item
    // => {     return item.item.length   }) this.setData({uploadOrdersFlag})
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.hideAll();
    app.globalData.selectedItems = cloneDeep(this.data.selectedItems);
    app.globalData.selectedItemsLen = this.data.selectedItemsLen;
    let _selectedItems = this.data.selectedItems;

    if (_selectedItems.length) {
      Object
        .keys(_selectedItems)
        .forEach(res => {
          if (res === 'length') {
            return
          }
          const {
            cateindex,
            subindex
          } = _selectedItems[res];
          this.data.listData[cateindex].items[subindex].quantity = 0
        })
      // this.setData({listData: this.data.listData})
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {}
})