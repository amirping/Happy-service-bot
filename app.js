var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index route 
app.get("/", function (req, res) {
  console.log("just a check");
  res.send("Deployed! BOT server is on");
});
app.post("/", function (req, res) {
  res.send(req);
})
