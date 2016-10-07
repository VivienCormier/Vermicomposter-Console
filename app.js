var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serialport = require('serialport');
var portName = '/dev/ttyACM0';
var nosql = require('nosql').load('./database.nosql');

// Server
server.listen(8081);

app.set('view engine', 'ejs');
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render(__dirname + '/pages/index');
});

app.get('/temperature/', function (req, res) {
  res.render(__dirname + '/pages/temperature', {data: 'This is the data'});
});

app.get('/humidity/', function (req, res) {
  res.render(__dirname + '/humidity');
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
})

io.on('connection', function (socket) {
  getLastData(function (data) {
    socket.emit('last_data', data);
  });
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
