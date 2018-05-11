const STAT_FLAG_CONF_USER = 1;
const STAT_FLAG_CONF_RESTO = 2;
const STAT_FLAG_CANCEL_USER = -1;
const STAT_FLAG_CANCEL_RESTO = -2;
class reservation {
    constructor(sessionId, date, time) {
        this.sessionId = sessionId;
        this.reservation_date = date;
        this.reservation_time = time;
        this.reservation_timestamp = Date.now();
        this.user = 'Reservation Agent';
        this.reservation_stat = 0;
    }
    getSessionId() {
        return this.sessionId;
    }
    getReservationDate() {
        return this.reservation_date;
    }
    getReservationTime() {
        return this.reservation_time;
    }
    setReservationDate(date) {
        this.reservation_date = date;
    }
    setReservationTime(time) {
        this.reservation_time = time;
    }
    setReservationPassTime(timestamp) {
        this.reservation_timestamp = timestamp;
    }
    setReservationStat(STAT_FLAG) {
        this.reservation_stat = STAT_FLAG;
    }
}
module.exports = reservation;