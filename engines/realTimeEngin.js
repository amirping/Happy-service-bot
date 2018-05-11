const orderManger = require('../engines/orderManager');
const reservationManger = require('../engines/reservationManger');
module.exports = {
    
    sendOrder:function(Order,socket){
        socket.emit('getOrder',Order);
    },
    sendReservation:function(Reservation,socket){
        socket.emit('getReservation', Reservation);
    },
    updateClient:function(update_pack,socket){
        console.log("let's update the client");
        console.log(update_pack);
        socket.emit('getUpdate',update_pack);
    },
    sendCancelOrder:function(sessionId,socket){
        socket.emit('cancelOrder',sessionId);
    },
    sendCancelReservation: function (sessionId,socket){
        socket.emit('cancelReservation', sessionId);
    },
    onAcceptOrder:function(socket,order_list){
        socket.on('AcceptOrder',function(data){
            console.log("i got accept dude");
            orderManger.confirmOrder(order_list, data.seesionId,2);
        })
    },
    onAcceptReservation: function (socket, reservation_list){
        socket.on('AcceptReservation', function (data) {
            console.log("i got accept dude");
            reservationManger.confirmReservation(reservation_list, data.seesionId, 2);
        })
    },
    onRejectOrder:function(socket,order_list){
        socket.on('RejectOrder', function (data) {
            console.log("i got reject dude");
            orderManger.cancelOrder(order_list, data.seesionId,-2);
        })
    },
    onRejectReservation: function (socket, reservation_list){
        socket.on('RejectReservation', function (data) {
            console.log("i got reject dude");
            reservationManger.cancelReservation(reservation_list, data.seesionId, -2);
        })
    }

}