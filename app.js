var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
const reqParser = require('./libs/reqParser');
var Order = require('./models/order');
const orderManger = require('./engines/orderManager');
const rtEngine = require('./engines/realTimeEngin');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rtClient ;
const STAT_FLAG_CONF_USER = 1;
const STAT_FLAG_CONF_RESTO = 2;
const STAT_FLAG_CANCEL_USER = -1;
const STAT_FLAG_CANCEL_RESTO = -2;

server.listen((process.env.PORT || 5000), '0.0.0.0');
// run time needed 
var order_list = new Array();

// midlewar things 
app.use(bodyParser.urlencoded({
  extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

// Server index route 


app.get("/", function (req, res) {
  console.log("just a check");
  res.send("Deployed! BOT server is on");
});

app.post("/", function (req, res) {
  //console.log(req.body);
  console.log("now we have " + orderManger.orderListSize(order_list) +" open session");
  
  let data_in = req.body;
  // it's not rservation context resolved intent 
  if (reqParser.isReservation(data_in) === false){
    // -> we are in order context 
    // take seesions and find meaning order->user
    let session = reqParser.getSessionID(data_in);
    let order = orderManger.getOrder(order_list, session);
    if(order === false){
      // create new one if there is no
      console.log("create new session ->");
      orderManger.startOrder(order_list,session);
      order = orderManger.getOrder(order_list, session);
      console.log(order_list);
      console.log("UP to " + orderManger.orderListSize(order_list) + " open session");
    }
    // check from the req the action 
    if (reqParser.getAction(data_in) === orderManger.CANCEL){
      orderManger.cancelOrder(order_list,session);
      console.log("end this session ->");
      res.status(200).json({order:"cancel",reason:"canceled by user"});
    }
    else if (reqParser.getAction(data_in) === orderManger.CONFIRM){
      orderManger.confirmOrder(order_list, session, STAT_FLAG_CONF_USER);
      // validate -> send to db -> send to user RT
      console.log("confirmed session -> notify all");
      // db have to perio if success db add then sand to rt else abort
      rtEngine.sendOrder(order_list[session],rtClient);
    }
    else{
      // depand on action -> do
      let action = reqParser.getAction(data_in);
      console.log("we have Action ->" + action);
      // check if params on 
      let params = reqParser.getParams(data_in);
      if(params.menu_item.length > 0 && reqParser.isCompletAction(data_in)){
        // there is things to add in order
        orderManger.addToOrder(params,order,reqParser.getMessage(data_in),reqParser.getQueryId(data_in));
        console.log(" full in order now is ");
        //res.status(200).send(order_list);
        //console.log(params);
        console.log(order_list);
      }
      else{
        // there is nothing it maybe an order start wich is alrady on
        console.log("up up su"); 
      } 
    }
  }
  else{
    console.log("not order context -> translate to reservation context");
  }
  //res.send(req);
  res.status(200).send({"req":true})
})

// Rt things 
io.on('connection', function (socket) {
  console.log("connected user RT");
  rtClient = socket;
  socket.emit('message', { hello: 'world' });
  socket.on('message', function (data) {
    console.log(data);
  });
});