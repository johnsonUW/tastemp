import fetch from './fetch.js';
import $api from './url.js';

const $ORDER = $api.$ORDER;

function getOrders(token) {
  return fetch({api: $ORDER.ORDERS, token});
}

function setOrders(data, token) {
  return fetch({api: $ORDER.ORDERS, data, token, method: `POST`});
}

function deleteOrderItem(orderItemID, token) {
  return fetch({api: $ORDER.ORDERS, path: `/${orderItemID}`, token, method: `DELETE`});
}

function putOrderItem(orderItemID, data, token) {
  return fetch({api: $ORDER.ORDERS, path: `/${orderItemID}`, method: `PUT`, token, data})
}

function confirmTableNumber(tableNumber, token) {
  return fetch({api: $ORDER.ORDERS, path: `/${tableNumber}/confirm`, method: `POST`, token})
}

let obj = {
  epochDateAfter: 0,
  skip: 0,
  take: 10,
  getNewOrders: true
}
function getHistoryOrders({
  epochDateAfter = obj.epochDateAfter,
  skip = obj.skip,
  take = obj.take,
  getNewOrders = obj.getNewOrders
} = obj, token) {

  return fetch({api: $ORDER.HISTORY, query: `?epochDateAfter=${epochDateAfter}&skip=${skip}&take=${take}&getNewOrders=${getNewOrders}`, token})
}
function getHistoryCount(epochDateAfter, token) {

  return fetch({api: $ORDER.HISTORY_COUNT, query: `?epochDateAfter=${epochDateAfter}`, token})
}

export default {
  getOrders,
  setOrders,
  deleteOrderItem,
  putOrderItem,
  confirmTableNumber,
  getHistoryOrders,
  getHistoryCount
}