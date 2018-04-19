import fetch from './fetch.js';
import $api from './url.js';
const $COMPANY = $api.$COMPANY;
function getAnCompany (token){
    return fetch({api:$COMPANY.COMPANY, token})
}
function setAnCompany(data, token){
    return fetch({api:$COMPANY.COMPANY,token, data, method:`PUT`})
}

function cashRemainingbalance(token){
    return fetch({api:$COMPANY.CASH_REMAINING_BALANCE,token, method:`PUT`})
}
export default{
    getAnCompany,
    setAnCompany,
    cashRemainingbalance
}