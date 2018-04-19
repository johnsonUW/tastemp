import fetch from './fetch.js';
import $api from './url.js';

const $UPLOAD = $api.$UPLOAD

/**
 * Delete an File on the Server
 *
 * @param {any} token
 * @param {any} blobURL
 * @returns
 */
function deleteFile(token, blobURL) {
    return fetch({api: $UPLOAD.UPLOAD, method: `DELETE`, data: blobURL, token});
}

/**
 * Upload an file to the Server
 *
 * @param {any} token
 * @param {any} filePath
 * @param {string} [name='file']
 * @returns
 */
function uploadFile(token, filePath, name = 'file') {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: $UPLOAD.UPLOAD,
            filePath: filePath,
            name: name,
            header: {
                'content-type': 'multipart/form-data',
                "ApiSessionToken": token
            },
            success: resolve,
            fail: reject
        })
    })
}

export default {
    deleteFile,
    uploadFile
}