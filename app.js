var express = require('express');
var app = express();
var server = require('http').Server(app);
var serialport = require('serialport');
var portName = '/dev/ttyACM0';
var nosql = require('nosql').load('./database.nosql');

// Server
server.listen(8081);

app.set('view engine', 'ejs');
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  getLastData(function (datas) {
    res.render(__dirname + '/pages/index', {data: datas});
  });
});

app.get('/temperature/', function (req, res) {
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, datas, count) {
      res.render(__dirname + '/pages/temperature', {data: datas});
  });
});

app.get('/humidity/', function (req, res) {
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, datas, count) {
      res.render(__dirname + '/pages/humidity', {data: datas});
  });
});

// Arduino data
var sp = new serialport(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

sp.on('data', function(input) {
    var json = JSON.parse(input);
    saveData(json);
});

sp.on('error', function(err) {
  console.log('Error: ', err.message);
});

// Data
function saveData(data) {
  data["date"] = getCurrentTimestamp();
  nosql.insert(data);
}

function getCurrentTimestamp() {
  return Math.floor(Date.now()/1000);
}

function getLastData(callback) {
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, datas, count) {
      callback(datas[0]);
  });
}
