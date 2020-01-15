var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 30,
  right: 40,
  bottom: 200,
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
var chosenXAxis = "poverty";
//var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
// function yScale(healthData, chosenYAxis) {
//   // create scales
//   var yLinearScale = d3.scaleLinear()
//     .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
//       d3.max(healthData, d => d[chosenYAxis]) * 1.2
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

  if (chosenXAxis === "poverty") {
    var label = "Poverty :";
  }
  else if (chosenXAxis === "age") {
    var label = "Age :";
  }
  else {
    var label = "Income :";
  }

  var ylabel = "obesity :";
  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d.obesity}`);
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
d3.csv("./assets/data/Data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.obesity)])
    .range([height, 0]);


  // yLinearScale function above csv import
  //var yLinearScale = yScale(healthData, chosenYAxis);


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
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //.attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");

    //append initial text
    var textsGroup = chartGroup.selectAll(".stateText")
        .data(healthData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        //.attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("y", d => yLinearScale(d.obesity))
        .attr("dx", -8)
        .attr("dy", 3)
        .attr("font-size", "10px")
        .attr("fill", "pink")
        .text(function(d) { return d.abbr });

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("age (median)");

    var incomesLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income (median)");

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
    .text("Obesity (%)");

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
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // functions here found above csv import
        // updates x scale for new data
        // yLinearScale = xScale(healthData, chosenYAxis);
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
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
