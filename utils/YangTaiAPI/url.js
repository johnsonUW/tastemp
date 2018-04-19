// const BASE_URL = ``;
const BASE_URL = `https://foodorder.chinacloudsites.cn`;

const $ACCOUNT = {
  CUSTOMER_LOGIN: BASE_URL + `/api/v1/accounts/login`,
  ADMIN_CODE: BASE_URL + `/api/v1/accounts/admin/logincode`,
  ADMIN_ACCOUNT: BASE_URL + `/api/v1/accounts/admin`
}
const $COMPANY = {
  COMPANY: BASE_URL + `/api/v1/company`,
  CASH_REMAINING_BALANCE: BASE_URL + `/api/v1/company/cashremainingbalance`
}
const $MENU = {
  MENU: BASE_URL + `/api/v1/menu`,
  CATEGORIES: BASE_URL + `/api/v1/menu/categories`,
}
const $ORDER = {
  ORDERS: BASE_URL + `/api/v1/orders`,
  HISTORY: BASE_URL + `/api/v1/orders/history`,
  HISTORY_COUNT: BASE_URL + `/api/v1/orders/history/count`,
}
const $UPLOAD = {
  UPLOAD: BASE_URL + `/api/v1/upload`
}
const $WECHAT_PAY = {
  INITIALIZE: BASE_URL + `/api/v1/payment/initialize`,
  PAYMENT_SIGN: BASE_URL + `/api/v1/payment/paymentsign`,
  CUSTOMER_COMPLETE: BASE_URL + `/api/v1/payment/complete`,
}

const TEST_URL = "https://easy-mock.com/mock/59abab95e0dc66334199cc5f/coco/aa"

export default {
  BASE_URL,
  TEST_URL,
  $ACCOUNT,
  $COMPANY,
  $MENU,
  $ORDER,
  $UPLOAD,
  $WECHAT_PAY
}