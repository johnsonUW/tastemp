import _fetch from './fetch.js';
import $api from './url.js';
/**
 * Customer login
 *
 * @param {any} data
 * {
 *"code": "string",
 *"restaurantCode": 0
 * }
 * @returns
 */
const $ACCOUNT = $api.$ACCOUNT;

function customerLogin(data) {
    return _fetch({api: $ACCOUNT.CUSTOMER_LOGIN, data, method:`POST`})
}

function getAdminLoginCode(phoneNumber){    
    return _fetch({api:$ACCOUNT.ADMIN_CODE, query:`?phoneNumber=${phoneNumber}`})
}

function getAdminAccountToken(phoneNumber, code){
    return _fetch({api:$ACCOUNT.ADMIN_ACCOUNT, query:`?phoneNumber=${phoneNumber}&code=${code}`})
}
function getAdminAccount(token){
    return _fetch({api:$ACCOUNT.ADMIN_ACCOUNT, token, method:`GET`})
}
function deleteAdminAccount(token, id){
    return _fetch({api:$ACCOUNT.ADMIN_ACCOUNT, query:`?id=${id}`,token, method:`DELETE`})
}
function setAdminAccount(token,phoneNumber){
    return _fetch({api:$ACCOUNT.ADMIN_ACCOUNT, query:`?phoneNumber=${phoneNumber}`,token, method:`POST`})
}
export default {
    customerLogin,
    getAdminLoginCode,
    getAdminAccount,
    setAdminAccount,
    getAdminAccountToken,
    deleteAdminAccount
}