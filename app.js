var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serialport = require('serialport');
var portName = '/dev/ttyACM0';
var nosql = require('nosql').load('./database.nosql');

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
  nosql.top(1, function(err, selected) {
    socket.emit('last_data', selected[0]);
  });
  socket.on('simulation_data', function (data) {
    var d = data["test"];
    var json = JSON.parse(d);
    saveData(json);
  });
});

server.listen(8081);

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

function saveData(data) {
  data["date"] = getCurrentTimestamp();
  nosql.insert(data);
}

function getCurrentTimestamp() {
  return Math.floor(Date.now()/1000);
}
