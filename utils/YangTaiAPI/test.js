import fetch from './fetch.js';
import $api from './url.js';

function getList (){
    return fetch({"api":$api.TEST_URL})
}

export default{
    getList
}