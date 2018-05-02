const STAT_FLAG_CONF_USER = 1;
const STAT_FLAG_CONF_RESTO = 2;
const STAT_FLAG_CANCEL_USER = -1;
const STAT_FLAG_CANCEL_RESTO = -2;
class order {
    constructor(sessionId,order_items) {
        this.sessionId = sessionId;
        this.order_items = order_items
        this.order_stat = 0;
    }
    getSessionId(){
        return this.sessionId;
    }
    getOrderItems(){
        return this.order_items;
    }
    addOrderItems(order_item){
        this.order_items.push(order_item);
    }
    setOrderStat(STAT_FLAG){
        this.order_stat = STAT_FLAG;
    }
}
module.exports = order;