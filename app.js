var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
const reqParser = require('./libs/reqParser');
var Order = require('./models/order');
var Reservation = require('./models/reservation');
const orderManger = require('./engines/orderManager');
const reservationManger = require('./engines/reservationManger');
const rtEngine = require('./engines/realTimeEngin');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rtClient;
const STAT_FLAG_CONF_USER = 1;
const STAT_FLAG_CONF_RESTO = 2;
const STAT_FLAG_CANCEL_USER = -1;
const STAT_FLAG_CANCEL_RESTO = -2;

// run time needed 
var order_list = new Array();
var reservation_list = new Array();
// in case of shutdown or other thing get back data 
orderManger.reloadPendingOrder().then((response) => {
    if (response.data.ok === true) {
      response.data.data.forEach(order => {
        if (order.order_stat === 1 || order.order_stat === 2) {
          // this is pending order 
          order_list[order.sessionId] = order;
        }
      });
    }
  })
  .catch((err) => {
    console.log(JSON.stringify(err));
  });
// in case of shutdown or other thing get back data 
reservationManger.reloadPendingReservation().then((response) => {
    if (response.data.ok === true) {
      response.data.data.forEach(reservation => {
        if (reservation.reservation_stat === 1 || reservation.reservation_stat === 2) {
          // this is pending order 
          reservation_list[reservation.sessionId] = reservation;
        }
      });
    }
  })
  .catch((err) => {
    console.log(JSON.stringify(err));
  });
// run this bloody server
server.listen((process.env.PORT || 5000), '0.0.0.0');
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
  console.log("now we have " + orderManger.orderListSize(order_list) + " open session in order");
  console.log("now we have " + reservationManger.reservationListSize(reservation_list) + " open session in reservation");
  let data_in = req.body;
  // it's not rservation context resolved intent 
  if (reqParser.isReservation(data_in) === false) {
    // -> we are in order context 
    // take seesions and find meaning order->user
    let session = reqParser.getSessionID(data_in);
    let order = orderManger.getOrder(order_list, session);
    if (order === false) {
      // create new one if there is no
      console.log("create new session ->");
      orderManger.startOrder(order_list, session);
      order = orderManger.getOrder(order_list, session);
      console.log(order_list);
      console.log("UP to " + orderManger.orderListSize(order_list) + " open session");
    }
    // check from the req the action  ** track will be traited later ** 
    if (reqParser.getAction(data_in) === orderManger.CANCEL) {
      orderManger.cancelOrder(order_list, session, STAT_FLAG_CANCEL_USER).then(data => {
        if (data.data.ok === true) {
          console.log("end this session ->");
          rtEngine.sendCancelOrder(order_list[session].sessionId, rtClient);
          //res.status(200).json({order:"cancel",reason:"canceled by user"});
        }
      }).catch(err => {
        console.log(err);
      })

    } else if (reqParser.getAction(data_in) === orderManger.CONFIRM) {
      orderManger.confirmOrder(order_list, session, STAT_FLAG_CONF_USER);
      // validate -> send to db -> send to user RT
      console.log("confirmed session -> notify all");
      // db have to perio if success db add then sand to rt else abort
      orderManger.saveOrder(order_list[session]).then((response) => {
          if (response.data.ok === true && response.data.msg === 'saved') {
            let id_ord = response.data.id;
            order_list[session]._id = id_ord;
            rtEngine.sendOrder(order_list[session], rtClient);
          }
        })
        .catch((err) => {
          console.log(err);
        })
    } else {
      // depand on action -> do
      let action = reqParser.getAction(data_in);
      console.log("we have Action ->" + action);
      // check if params on 
      let params = reqParser.getParams(data_in);
      if (params.menu_item.length > 0 && reqParser.isCompletAction(data_in)) {
        // there is things to add in order
        orderManger.addToOrder(params, order, reqParser.getMessage(data_in), reqParser.getQueryId(data_in));
        console.log(" full in order now is ");
        //res.status(200).send(order_list);
        //console.log(params);
        console.log(order_list);
      } else {
        // there is nothing it maybe an order start wich is alrady on
        console.log("up up su");
      }
    }
  } else {
    console.log("not order context -> translate to reservation context");
    // we can got only 2 action from context -> pass or cancel 
    let session = reqParser.getSessionID(data_in);
    let reservation = reservationManger.getReservation(reservation_list, session);
    if (reservation === false) {
      // create new one if there is no
      console.log("create new session -> reservation session as i get");
      reservationManger.startReservation(reservation_list, session);
      reservation = reservationManger.getReservation(reservation_list, session);
      console.log(reservation_list);
      console.log("UP to " + reservationManger.reservationListSize(reservation_list) + " open reservation session");
    }
    // ndepand on the action do job
    if (reqParser.getAction(data_in) === reservationManger.ADD) {
      console.log("it's reservation pass");
      // we don't trigger creator until we are sure we have enough arags to fire up 
      if(reqParser.isCompletAction(data_in)){
       console.log("we have every thing in so let's go");
       // parse params start every thing then save , push ... come on dude  you can do that
        let params = reqParser.getParams(data_in);
        reservation.setReservationDate(params.date);
        reservation.setReservationTime(params.time);
        reservationManger.confirmReservation(reservation_list,session,STAT_FLAG_CONF_USER);
        // save db then 
        reservationManger.saveReservation(reservation_list[session]).then((response) => {
          if (response.data.ok === true && response.data.msg === 'saved') {
            let id_reservation = response.data.id;
            reservation_list[session]._id = id_reservation;
            console.log("send now");
            rtEngine.sendReservation(reservation_list[session], rtClient); 
          }
        })
          .catch((err) => {
            console.log(err);
          })
      } 
    } else if (reqParser.getAction(data_in) === reservationManger.CANCEL) {
      // emmm , let(s delete that one)
      console.log("it's cancel of reservation");
      reservationManger.cancelReservation(reservation_list, session, STAT_FLAG_CANCEL_USER).then(data => {
        if (data.data.ok === true) {
          console.log("end this session ->");
          rtEngine.sendCancelReservation(reservation_list[session].sessionId, rtClient);
          //res.status(200).json({order:"cancel",reason:"canceled by user"});
        }
      }).catch(err => {
        console.log(err);
      })
    }
    else{
      // that's weird coz we don't come here in any case but u know we have to expect every thing when you deal with humans
    }
  }
  //res.send(req);
  res.status(200).send({
    "req": true
  });
});

// Rt things 
io.on('connection', function (socket) {
  console.log("connected user RT");
  rtClient = socket;
  socket.emit('message', {
    hello: 'world'
  });
  // create pack to send to client 
  let pack = {
    'update_order': orderManger.getPackOrder(order_list),
    'update_reservation': reservationManger.getPackReservation(reservation_list) 
  }
  rtEngine.updateClient(pack, rtClient);
  socket.on('message', function (data) {
    console.log(data);
  });
  rtEngine.onAcceptOrder(socket, order_list);
  rtEngine.onRejectOrder(socket, order_list);
  rtEngine.onAcceptReservation(socket, reservation_list);
  rtEngine.onRejectReservation(socket, reservation_list);
});