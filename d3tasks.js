
//this d3 plotting code was found at:
//http://bl.ocks.org/weiglemc/6185069
function drawFittsScatter(data) {

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  console.log(data);

  /*
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */

  // setup x
  var xValue = function(d) { return d.time;}, // data -> value
      xScale = d3.scale.linear().range([0.0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  // setup y
  var yValue = function(d) { return d.fitts;}, // data -> value
      yScale = d3.scale.linear().range([height, 0.0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  // setup fill color
  var cValue = function(d) { return "abc";},
  color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var svg = d3.select("body").append("center").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // // load data
  // d3.csv("cereal.csv", function(error, data) {
  //
  //   // change string (from CSV) into number format
  //   data.forEach(function(d) {
  //     d.Calories = +d.Calories;
  //     d["Protein (g)"] = +d["Protein (g)"];
  // //    console.log(d);
  //   });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Time (ms)");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Fitts' Rating (ie. Difficulty)");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", 0.9);
            tooltip.html(d.start + " to " + d.end + "<br/> (" + xValue(d) + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });
}


//click data is a list of dicts in the form {x: 123, y:123, valid:true}
function drawClickDots(data){
  var svg = d3.select("body").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("top", "0px")
            .style("left", "0px")
            .style("position", "absolute");


  for(var d in data) {
    var datapoint = data[d];

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .style("fill", function(d){if(d.valid) {return "#00FF00";} else {return "#FF0000";}});

    }
}
