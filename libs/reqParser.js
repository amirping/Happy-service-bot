module.exports = {
    getSessionID: function (body) {
        return body.sessionId;
    },
    getAction: function (body) {
        return body.result.action;
    },
    getParams: function (body) {
        return body.result.parameters;
    },
    getMessage: function (body) {
        return body.result.resolvedQuery;
    },
    getContext: function (body) {
        // console.log("contexts");
        // console.log(body.result.contexts);
        return body.result.contexts;
    },
    getIntent: function (body) {
        return body.result.metadata.intentName;
    },
    isReservation: function (body) {
        let contexts = this.getContext(body);
        flag = true;
        contexts.forEach(element => {
            //console.log("isReservation loop");
            //console.log(element.name);
            if (element.name === "order" || element.name.startsWith('order') || element.name.endsWith('order')) {
                flag = false;
            }
        });
        return flag;
    },
    isCompletAction: function (body) {
        return !body.result.actionIncomplete
    },
    getQueryId: function (body) {
        return body.id;
    }


}