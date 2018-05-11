const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
var http = require('http');
const axios = require('axios');
const APIdomain = 'http://localhost:3000/api/order';
module.exports = {
    START: "order_start",
    ADD: "order_add_item",
    CANCEL: "order_cancel",
    CONFIRM: "order_confirm",
    /**
     * getOrder : return the order or false if it's a new order
     */
    getOrder:function(order_list,sessionId){
        if (order_list[sessionId] == null || !order_list[sessionId]){
            return false
        }
        return order_list[sessionId];
    },
    startOrder:function(order_list,sessionId){
        order_list[sessionId] = new Order(sessionId,[]);
    },
    cancelOrder: function (order_list, sessionId , STAT_FLAG){
       //-> err  //  order_list[sessionId].setOrderStat(STAT_FLAG);
        order_list[sessionId].order_stat = STAT_FLAG
        // notify db 
        return axios.patch(APIdomain + "/" + order_list[sessionId]._id, { 'orderStat': -1 })
        // notify panel
    },
    confirmOrder: function (order_list, sessionId , STAT_FLAG){
       //-> err // order_list[sessionId].setOrderStat(STAT_FLAG);
        order_list[sessionId].order_stat = STAT_FLAG
        if(STAT_FLAG === 1){
            order_list[sessionId].setOrderTime(Date.now());
        }
    },
    trackOrder: function (sessionId){
        // return order stat
    },
    orderListSize:function(order_list){
        return Object.keys(order_list).length;
    },
    addToOrder:function(params,order,message,queryid){
        //console.log("you fire me whene ");
        //console.log(JSON.stringify(params));
        params.menu_item.forEach(function (element, i) {
            let number = (params.number[i] != null && params.number != undefined) ? params['number'][i] : 1 ;
            let extra = (params['unit-weight-name'][i] != null && params['unit-weight-name'] != undefined) ? params['unit-weight-name'][i] : '' ;
            let item = new OrderItem(element,queryid,message,extra,number);
            // console.log("item to add is ");
            // console.log(item);
            order.addOrderItems(item);
        });
    },
    getPackOrder:function(order_list){
        // return all order with stat not actionIncomplete
        var order_pack = [];
        console.log("generate pack plz wait");
        let keys = Object.keys(order_list);
        keys.forEach(orderKey => {
            let order = order_list[orderKey];
            console.log("order to pack");
            console.log(order);
            if (order.order_stat != 0) {
                order_pack.push(order)
            }
        });
       return order_pack; 
    },
    saveOrder:function(order){
        return axios.post(APIdomain, {
            order: order,
        })
    },
    reloadPendingOrder:function(){
        return axios.get(APIdomain)
    }
}