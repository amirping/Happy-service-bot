class orderItem {
    constructor(menu_item, queryId, message, extra, number) {
        this.menu_item = menu_item;
        this.number = number;
        this.extra = extra;
        this.queryId = queryId;
        this.message = message;
    }
    getMenu_item() {
        return this.menu_item;
    }
    getNumber() {
        return this.number;
    }
    getExtra(){
        return this.extra
    }
    getQueryId(){
        return this.queryId
    }
    getMessage(){
        return this.message
    }
}
module.exports = orderItem;