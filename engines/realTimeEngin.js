module.exports = {
    
    sendOrder:function(Order,socket){
        socket.emit('getOrder',Order);
    },
    sendReservation:function(Reservation){

    },
    updateClient:function(){

    },
    sendCancelOrder:function(){

    },
    sendCancelReservation:function(){

    },
    onAcceptOrder:function(){

    },
    onAcceptReservation:function(){

    },
    onRejectOrder:function(){

    },
    onRejectReservation:function(){

    }

}