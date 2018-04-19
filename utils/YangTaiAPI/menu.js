import fetch from './fetch.js';
import $api from './url.js';

const $MENU = $api.$MENU;

function getMenu(token) {
    return fetch({api: $MENU.MENU,token})
}

function getCategories(token) {
    return fetch({api: $MENU.CATEGORIES, token})
}

function setCategories(token,data) {
    return fetch({api: $MENU.CATEGORIES,token, data, method: `POST`})
}

function deleteItemFromCategories(token,categoryId) {
    return fetch({api: $MENU.CATEGORIES, path: `/${categoryId}`,token, method: `DELETE`})
}

function setAnItemToCategories(token,categoryId, data) {
    return fetch({api: $MENU.CATEGORIES, path: `/${categoryId}`,token, method: `PUT`})
}

function getAnCategory(token,categoryId) {
    return fetch({api: $MENU.MENU, path: `/${categoryId}`, token})
}

function setAnCategory(token,categoryId, data) {
    return fetch({api: $MENU.MENU, path: `/${categoryId}`, data, method: `POST`})
}

function deleteItemFromMenuCategory(token,categoryId, itemId) {
    return fetch({api: $MENU.MENU, path: `/${categoryId}/${itemId}`, token,method: `DELETE`})
}

function setItemToMenuCategory(token,categoryId, itemId, data) {
    return fetch({api: $MENU.MENU,token, path: `/${categoryId}/${itemId}`, data, method: `PUT`})
}

export default {
    getMenu,
    getCategories,
    setCategories,
    deleteItemFromCategories,
    setAnItemToCategories,
    getAnCategory,
    setAnCategory,
    deleteItemFromMenuCategory,
    setItemToMenuCategory
}