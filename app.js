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

app.get('/condensation/', function (req, res) {
  var day = 1;
  if (req.query['day']) {
    day = req.query['day'];
  }
  var before_date = getCurrentTimestamp() - 60 * 60 * 24 * day;
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, data, count) {
    var data_level_1 = [];
    var data_level_2 = [];
    var data_level_3 = [];
    var full_data = [];
    data.forEach(function (row) {
      if (row.date > before_date) {
        full_data.push(row);
        if (row.condensation_top) {
          var new_row = JSON.parse(JSON.stringify(row));
          var cond = ((1023 - row.condensation_top) * 100 / 1023).toFixed(2);
          row.data_level_1 = cond;
          new_row.data = cond;
          new_row.fan = row.fan_level_1_enabled;
          data_level_1.push(new_row);
        }
      }
    });
    res.render(__dirname + '/pages/condensation', {
      full_data: full_data,
      data_level_1: data_level_1,
      data_level_2: data_level_2,
      data_level_3: data_level_3
    });
  });
});

app.get('/temperature/', function (req, res) {
  var day = 1;
  if (req.query['day']) {
    day = req.query['day'];
  }
  var before_date = getCurrentTimestamp() - 60 * 60 * 24 * day;
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, data, count) {
    var data_level_1 = [];
    var data_level_2 = [];
    var data_level_3 = [];
    var full_data = [];
    data.forEach(function (row) {
      if (row.date > before_date) {
        full_data.push(row);
        if (row.temp_level_1 && row.temp_level_1 != "-127") {
          var new_row = JSON.parse(JSON.stringify(row));
          row.data_level_1 = row.temp_level_1;
          new_row.data = row.temp_level_1;
          new_row.fan = row.fan_level_1_enabled;
          data_level_1.push(new_row);
        }
        if (row.temp_level_2 && row.temp_level_2 != "-127") {
          var new_row = JSON.parse(JSON.stringify(row));
          row.data_level_2 = row.temp_level_2;
          new_row.data = row.temp_level_2;
          new_row.fan = row.fan_level_2_enabled;
          data_level_2.push(new_row);
        }
        if (row.temp_level_3 && row.temp_level_3 != "-127") {
          var new_row = JSON.parse(JSON.stringify(row));
          row.data_level_3 = row.temp_level_3;
          new_row.data = row.temp_level_3;
          new_row.fan = row.fan_level_3_enabled || row.fan_top_box_enabled;
          data_level_3.push(new_row);
        }
      }
    });
    res.render(__dirname + '/pages/temperature', {
      full_data: full_data,
      data_level_1: data_level_1,
      data_level_2: data_level_2,
      data_level_3: data_level_3
    });
  });
});

app.get('/humidity/', function (req, res) {
  var day = 1;
  if (req.query['day']) {
    day = req.query['day'];
  }
  var before_date = getCurrentTimestamp() - 60 * 60 * 24 * day;
  nosql.sort(function(data) {
      return data;
  }, function(a, b) {
      if (a.date < b.date)
          return -1;
      return 1;
  }, function(err, data, count) {
    var data_level_1 = [];
    var data_level_2 = [];
    var data_level_3 = [];
    var full_data = [];
    data.forEach(function (row) {
      if (row.date > before_date) {
        full_data.push(row);
        if (row.humd_level_1) {
          var new_row = JSON.parse(JSON.stringify(row));
          var humd = ((1023 - row.humd_level_1) * 100 / 1023).toFixed(2);
          row.data_level_1 = humd;
          new_row.data = humd;
          new_row.fan = row.fan_level_1_enabled;
          data_level_1.push(new_row);
        }
        if (row.humd_level_2) {
          var new_row = JSON.parse(JSON.stringify(row));
          var humd = ((1023 - row.humd_level_2) * 100 / 1023).toFixed(2);
          row.data_level_2 = humd;
          new_row.data = humd;
          new_row.fan = row.fan_level_2_enabled;
          data_level_2.push(new_row);
        }
        if (row.temp_level_3) {
          var new_row = JSON.parse(JSON.stringify(row));
          var humd = ((1023 - row.humd_level_3) * 100 / 1023).toFixed(2);
          row.data_level_3 = humd;
          new_row.data = humd;
          new_row.fan = row.fan_level_3_enabled || row.fan_top_box_enabled;
          data_level_3.push(new_row);
        }
      }
    });
    res.render(__dirname + '/pages/humidity', {
      full_data: full_data,
      data_level_1: data_level_1,
      data_level_2: data_level_2,
      data_level_3: data_level_3
    });
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
      callback(datas[count-1]);
  });
}
