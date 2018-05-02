const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
module.exports = {
    START: "order_start",
    ADD: "oder_add_item",
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
        order_list[sessionId] = null;
        // notify db 
        // notify panel
    },
    confirmOrder: function (order_list, sessionId , STAT_FLAG){
        // push to db 
        // push to panel 
    },
    trackOrder: function (sessionId){
        // return order stat
    },
    orderListSize:function(order_list){
        return Object.keys(order_list).length;
    },
    addToOrder:function(params,order,message,queryid){
        params.menu_item.forEach(function (element, i) {
            let number = params.number[i] != null ? params.number[i] : 1 ;
            let extra = params['unit-weight-name'][i] != null ? params['unit-weight-name'][i] : '' ;
            let item = new OrderItem(element,queryid,message,extra,number);
            // console.log("item to add is ");
            // console.log(item);
            order.addOrderItems(item);
        });
    }
}