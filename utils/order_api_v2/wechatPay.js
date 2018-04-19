import _fetch from './fetch.js';
import $api from './url.js';
const {WECHAT_PAY: $WECHAT_PAY} = $api;

function initializePayment(userID, orderID) {
    return _fetch({
        api: $WECHAT_PAY.INIT,
        data: {
            "userId": userID,
            "orderId": orderID
        },
        method: `POST`
    });
}

function postCompletePayment(data, token) {
    return _fetch({api: $WECHAT_PAY.COMPLETE, token, method: `POST`, data})
}
function putCompletePayment(data, token) {
    return _fetch({api: $WECHAT_PAY.COMPLETE, token, method: `PUT`, data})
}

// function getPaymentSign(token, data){     return
// _fetch({api:$WECHAT_PAY.PAYMENT_SIGN, token, method:`POST`, data}) }
export default {
    initializePayment,
    postCompletePayment,
    putCompletePayment
}