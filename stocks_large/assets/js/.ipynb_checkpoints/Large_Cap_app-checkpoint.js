var svgWidth = 1500;
var svgHeight = 650;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "Price";
//var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(stockData, chosenXAxis) {
// create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stockData, d => d[chosenXAxis]) * 0.1,
      d3.max(stockData, d => d[chosenXAxis]) * 0.65
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
// function yScale(stockData, chosenYAxis) {
//   // create scales
//   var yLinearScale = d3.scaleLinear()
//     .domain([d3.min(stockData, d => d[chosenYAxis]) * 0.8,
//       d3.max(stockData, d => d[chosenYAxis]) * 1.2
//     ])
//     .range([0, height]);

//   return yLinearScale;

// }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
// function renderYAxes(newYScale, yAxis) {
//   var leftAxis = d3.axisLeft(newYScale);

//   yAxis.transition()
//     .duration(1000)
//     .call(leftAxis);

//   return yAxis;
// }

// function used for updating circles group with a transition to
// new circles
//, newYScale, chosenYAxis
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]))
   //.attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


// function used for updating texts within circles group with a transition to
// new texts in circles
//, newYScale, chosenYAxis
function renderTexts(textsGroup, newXScale, chosenXAxis) {

  textsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    //.attr("y", d => newYScale(d[chosenYAxis]));

  return textsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "Price") {
    var label = "Price ($) :";
  }
  // else if (chosenXAxis === "age") {
  //   var label = "Age :";
  // }
  else {
    var label = "Change ($) :";
  }

  var ylabel = "Volume :";
  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.Name}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d.Volume}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/stocks_large_cap.csv").then(function(stockData, err) {
  if (err) throw err;

  // parse data
  stockData.forEach(function(data) {
    data.Price = +data.Price;
    data.Volume = +data.Volume;
    data.Change = +data.Change;
    // data.income = +data.income;
    // data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stockData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(stockData, d => d.Volume)])
    .range([height, 0]);


  // yLinearScale function above csv import
  //var yLinearScale = yScale(stockData, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);
  // var yAxis = chartGroup.append("g")
  //   .classed("y-axis", true)
  //   .attr("transform", `translate(0, ${width})`)
  //   .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stockData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //.attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("cy", d => yLinearScale(d.Volume))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");

    //append initial text
    var textsGroup = chartGroup.selectAll(".stateText")
        .data(stockData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        //.attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("y", d => yLinearScale(d.Volume))
        .attr("dx", -12)
        .attr("dy", 3)
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(function(d) { return d.Symbol });

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var priceLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Price") // value to grab for event listener
    .classed("active", true)
    .text("Price ($)");

  var changeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Change") // value to grab for event listener
    .classed("inactive", true)
    .text("Change in Price ($)");

    // var incomesLabel = xlabelsGroup.append("text")
    // .attr("x", 0)
    // .attr("y", 60)
    // .attr("value", "income") // value to grab for event listener
    // .classed("inactive", true)
    // .text("Income (median)");

    // Create group for  3 y- axis labels
  // var ylabelsGroup = chartGroup.append("g")
  // .attr("transform", "rotate(-90)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Volume (q)");

    // var obesityLabel = ylabelsGroup.append("text")
    // .attr("x", "x", 0 - (height / 2))
    // .attr("y", 0 - margin.left)
    // .attr("value", "obesity") // value to grab for event listener
    // .classed("active", true)
    // .text("Obesity (%)");

    // var smokesLabel = ylabelsGroup.append("text")
    // .attr("x", "x", 0 - (height / 2))
    // .attr("y", 0 - margin.left)
    // .attr("value", "smokes") // value to grab for event listener
    // .classed("active", true)
    // .text("Smokes (median)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stockData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // functions here found above csv import
        // updates x scale for new data
        // yLinearScale = xScale(stockData, chosenYAxis);
        // // updates y axis with transition
        // yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
       // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates texts within circles with new x values
        textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis);
        //textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        

        // changes classes to change bold text
        if (chosenXAxis === "Price") {
          priceLabel
            .classed("active", true)
            .classed("inactive", false);
          changeLabel
            .classed("active", false)
            .classed("inactive", true);
          // incomesLabel
          //   .classed("active", false)
          //   .classed("inactive", true);
        }
        // else if (chosenXAxis === "age"){
        //   priceLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        //   changeLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        //   incomesLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // }
        else {
          priceLabel
            .classed("active", false)
            .classed("inactive", true);
          // changeLabel
          //   .classed("active", false)
          //   .classed("inactive", true);
          changeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
