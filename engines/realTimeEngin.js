module.exports = {
    
    sendOrder:function(Order,socket){
        socket.emit('getOrder',Order);
    },
    sendReservation:function(Reservation){

    },
    updateClient:function(update_pack,socket){
        console.log("let's update the client");
        console.log(update_pack);
        socket.emit('getUpdate',update_pack);
    },
    sendCancelOrder:function(sessionId,socket){
        socket.emit('cancelOrder',sessionId);
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