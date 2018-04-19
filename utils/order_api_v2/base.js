import _fetch from './fetch';
import $api from './url';

const {
    BASE_URL,
    USERS,
    RESTAURANTS,
    MENU,
    PREFERENCES,
    SUBMIT,
    ORDERS
} = $api;

/* menu */
function getMenu(resID) {
    return _fetch({api: MENU.BASE, path: `/${resID}`});
}

/* orders */
function getAnOrderInfo(orderID) {
    return _fetch({
        api: ORDERS.BASE,
        data: {
            "orderId": orderID
        },
        method: `POST`
    });
}

// function getUserOrders(userID){     return _fetch({api:ORDERS.BASE,
// path:`/${userID}`}); }

function getHistoryOrders(userID, restaurantID) {
    return _fetch({api: ORDERS.BASE, path: `/${userID}`, query: `/?restaurantId=${restaurantID}`});
}

/* preference */
function getUserPreference(userID, restaurantID) {
    return _fetch({api: PREFERENCES.BASE, path: `/${userID}`, query: `/?restaurantId=${restaurantID}`});
}

/* restaurant */
function getRestaurantInfo(resID) {
    return _fetch({api: RESTAURANTS.BASE, path: `/${resID}`});
}

/* submit */
function submitOrder(data) {
    return _fetch({api: SUBMIT.SUBMIT_ORDER, data, method: `POST`});
}

function submitPayOption(userID, orderID) {
    return _fetch({
        api: SUBMIT.CASH_OR_CREDIT_PAY,
        data: {
            "orderId": orderID,
            "userId": userID
        },
        method: `POST`
    });
}

/* users */
function userLogin(loginCode) {
    return _fetch({api: USERS.USER_LOGIN, query: `/${loginCode}`});
}

export default {
    getAnOrderInfo,
    getHistoryOrders,
    getMenu,
    getRestaurantInfo,
    getUserPreference,
    submitOrder,
    userLogin,
    submitPayOption
}