// const BASE_URL = `https://tasteservice.applinzi.com`;
const BASE_URL = `https://tasteservice.chinacloudsites.cn`;

const MENU = {
    BASE: `${BASE_URL}/api/v1/menu`
}

const ORDERS = {
    BASE: `${BASE_URL}/api/v1/orders`
}

const PREFERENCES = {
    BASE: `${BASE_URL}/api/v1/preferences`
}

const RESTAURANTS = {
    BASE: `${BASE_URL}/api/v1/restaurants`
}

const SUBMIT = {
    SUBMIT_ORDER: `${BASE_URL}/api/v1/submit/order`,
    CASH_OR_CREDIT_PAY: `${BASE_URL}/api/v1/submit/cashorcreditpay`
}

const USERS = {
    USER_LOGIN: `${BASE_URL}/api/v1/users`
}

const WECHAT_PAY = {
    INIT: `${BASE_URL}/api/v1/payment/initialize`,
    COMPLETE: `${BASE_URL}/api/v1/payment/complete`
}

export default {
    BASE_URL,
    USERS,
    RESTAURANTS,
    MENU,
    PREFERENCES,
    SUBMIT,
    ORDERS,
    WECHAT_PAY
}