/**
 * 抓取远端API的结构
 * https://developers.douban.com/wiki/?title=movie_v2
 * @param  {String} obj    api 根地址
 * @param  {String} path   请求路径
 * @param  {Objece} params 参数
 * @return {Promise}       包含抓取任务的Promise
 */
const fetchObj = {
    api: '',
    path: '',
    query: '',
    method: 'GET',
    token: '',
    data: {},
    headerType: "application/json"
}

/**
 * 获取远端API的结构
 *
 * @param {any} [{
 *     api = fetchObj.api, //api api根地址
 *     path = fetchObj.path, // 请求路径
 *     query = fetchObj.query, // query参数
 *     method = fetchObj.method // 请求方法
 *     token = fetchObj.token //每个用户的请求头token
 *     data = fetchObj.data  //请求体参数
 * }=urlObj]    请求
 *
 * @returns {Promise} //包含抓取任务的Promise
 */
module.exports = function ({
    api = fetchObj.api,
    path = fetchObj.path,
    query = fetchObj.query,
    method = fetchObj.method,
    token = fetchObj.token,
    headerType = fetchObj.headerType,
    data = fetchObj.data
} = fetchObj) {
    return new Promise((resolve, reject) => {
        let header = {
            "content-type": headerType
        }
        if (token) {
            header.ApiSessionToken = token
        }
        wx.request({
            url: `${api}${path}${query}`,
            method: method,
            data: typeof data === 'object'? Object.assign({}, data): data,
            header: header,
            success: res => {
                if (res.data.errorCode) {
                    reject(res);
                }
                resolve(res);
            },
            fail: reject
        })
    })
}