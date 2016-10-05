var app = require('express')();
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
    io.emit('arduino', { data: input });
});

sp.on('error', function(err) {
  console.log('Error: ', err.message);
})

io.on('connection', function (socket) {
  socket.on('simulation_data', function (data) {
    var d = data["test"];
    var json = JSON.parse(d);
    saveData(json);
  });
});

server.listen(8081);

app.get('/', function (req, res) {
  nosql.each(function(doc, offset) {
    console.log(doc);
  });
  res.sendFile(__dirname + '/index.html');
});

function saveData(data) {
  data["date"] = getCurrentTimestamp();
  nosql.insert(data);
  console.log(data);
}

function getCurrentTimestamp() {
  return Math.floor(Date.now()/1000);
}
