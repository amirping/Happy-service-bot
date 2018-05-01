var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var app = express();
//app.use(bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());
app.listen((process.env.PORT || 5000), '0.0.0.0');
// run time needed 
var order_list = new Array();
// Server index route 
app.get("/", function (req, res) {
  console.log("just a check");
  res.send("Deployed! BOT server is on");
});

app.post("/", function (req, res) {
  console.log(req.body);
  
  // take seesions and find meaning order->user 
  // check from the req the action 
  // depand on action -> do 
  
  res.send(req);
})
