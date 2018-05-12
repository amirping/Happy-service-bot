const Reservation = require('../models/reservation');
var http = require('http');
const axios = require('axios');
const APIdomain = 'http://localhost:3000/api/reservation';
module.exports = {
    START: "reservation_pass",
    ADD: "reservation_pass",
    CANCEL: "reservation_cancel",
    CONFIRM: "reservation_pass",
    getReservation: function (reservation_list, sessionId) {
        if (reservation_list[sessionId] == null || !reservation_list[sessionId]) {
            return false;
        }
        return reservation_list[sessionId];
    },
    startReservation: function (reservation_list, sessionId,time,date) {
        reservation_list[sessionId] = new Reservation(sessionId,date,time);
    },
    cancelReservation: function (reservation_list, sessionId, STAT_FLAG) {
        reservation_list[sessionId].order_stat = STAT_FLAG;
        // notify db 
        return axios.patch(APIdomain + "/" + reservation_list[sessionId]._id, {
            'reservationStat': -1
        });
    },confirmReservation: function (reservation_list, sessionId, STAT_FLAG) {
        //-> err // order_list[sessionId].setOrderStat(STAT_FLAG);
        reservation_list[sessionId].reservation_stat = STAT_FLAG;
    },
    reservationListSize: function (reservation_list) {
        return Object.keys(reservation_list).length;
    },
    trackReservation: function () {

    },
    getPackReservation: function (reservation_list) {
        // return all order with stat not actionIncomplete
        var reservation_pack = [];
        console.log("generate pack plz wait");
        let keys = Object.keys(reservation_list);
        keys.forEach(reservationKey => {
            let reservation = reservation_list[reservationKey];
            console.log("reservation to pack");
            console.log(reservation);
            if (reservation.reservation_stat != 0) {
                reservation_pack.push(reservation)
            }
        });
        return reservation_pack;
    }
    ,
    saveReservation: function (reservation) {
        return axios.post(APIdomain, {
            reservation: reservation,
        });
    },
    reloadPendingReservation: function () {
        return axios.get(APIdomain);
    }
}