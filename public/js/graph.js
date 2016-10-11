// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the 1st line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.data); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// format the data
full_data.forEach(function(d) {
    d.date = new Date(d.date * 1000);
    d.data_level_1 = +d.data_level_1;
    d.data_level_2 = +d.data_level_2;
    d.data_level_3 = +d.data_level_3;
});

// format the data
fetchData(data_level_1);
fetchData(data_level_2);
fetchData(data_level_3);

// Scale the range of the data
x.domain(d3.extent(full_data, function(d) { return d.date; }));
y.domain([d3.min(full_data, function(d) {
  var datas = [];
  if (d.data_level_1) {
    datas.push(d.data_level_1);
  }
  if (d.data_level_2) {
    datas.push(d.data_level_2);
  }
  if (d.data_level_3) {
    datas.push(d.data_level_3);
  }
  return Math.min.apply(null, datas);
}), d3.max(full_data, function(d) {
  var datas = [];
  if (d.data_level_1) {
    datas.push(d.data_level_1);
  }
  if (d.data_level_2) {
    datas.push(d.data_level_2);
  }
  if (d.data_level_3) {
    datas.push(d.data_level_3);
  }
  return Math.max.apply(null, datas);
})]);

// Add the valueline path.
appendPath(data_level_1, "#437F49");
appendPath(data_level_2, "#83D493");
appendPath(data_level_3, "#D2FFD6");

// Add the dots
appendDot(data_level_1);
appendDot(data_level_2);
appendDot(data_level_3);

// Add the X Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
    .call(d3.axisLeft(y));

function fetchData(data) {
  data.forEach(function(d) {
      d.date = new Date(d.date * 1000);
      d.data = +d.data;
      d.fan = d.fan;
  });
}

function appendPath(data, color) {
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", color)
      .attr("d", valueline);
}

function appendDot(data) {
  svg.selectAll("g.dot")
    .data([data])
    .enter().append("g")
    .selectAll("circle")
    .data(function(d) { return d; })
    .enter().append("circle")
    .attr("r", 3)
    .attr("class", function(d) {
      if (d.fan) {
        return "fan_on";
      }
      return "fan_off";
    })
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.data); })
}
