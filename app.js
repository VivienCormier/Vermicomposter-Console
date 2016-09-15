var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serialport = require('serialport');
var portName = '/dev/ttyACM0';

var sp = new serialport(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

sp.on('data', function(input) {
    socket.emit('arduino', { data: input });
});

server.listen(8081);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('arduino', function (data) {
    console.log(data);
  });
});
