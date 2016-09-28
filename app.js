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
    io.emit('arduino', { data: input });
});

sp.on('error', function(err) {
  console.log('Error: ', err.message);
})

server.listen(8081);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
