import fetch from './fetch.js';
import $api from './url.js';
const $WECHAT_PAY = $api.$WECHAT_PAY;

function initializePayment(tableNumber,token) {
    return fetch({api: $WECHAT_PAY.INITIALIZE,query:`?tableNumber=${tableNumber}`, token, method: `POST`})
}

function customerCompletePayment(data, token) {
    return fetch({api: $WECHAT_PAY.CUSTOMER_COMPLETE, token, method: `POST`, data})
}

function getPaymentSign(token, data){
    return fetch({api:$WECHAT_PAY.PAYMENT_SIGN, token, method:`POST`, data})
}
export default {
    initializePayment,
    customerCompletePayment,
    getPaymentSign
}