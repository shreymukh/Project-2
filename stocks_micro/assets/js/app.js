//set svg and chart dimensions
//set svg dimensions
var svgWidth = 1300;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

//calculate chart height and width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "stock_price";
var chosenYAxis = "stock_volume";

// function used for updating x-scale var upon click on axis label
function xScale(stockData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stockData, d => d[chosenXAxis]) *-2.5,
            d3.max(stockData, d => d[chosenXAxis]) * 1.0
        ])
        .range([0, width]);

    return xLinearScale;
}

//function used for updating y-scale var upon clicking on axis label
function yScale(stockData, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stockData, d => d[chosenYAxis]) * 0.8,
            d3.max(stockData, d => d[chosenYAxis]) * 1.0
        ])
        .range([height, 0]);

    return yLinearScale;
}

//function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}


//function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// //function used for updating stock labels with a transition to new 
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

///////function to stylize x-axis values for tooltips///////
/////// function used for updating circles group with new tooltip/////////
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //stylize based on variable chosen
    //poverty percentage
    if (chosenXAxis === 'stock_price') {
        return `${value}%`;
    }

    //household income in dollars
   /* else if (chosenXAxis === 'stock_volume') {
        return `${value}%`;
    }*/
    //age (number)
    else {
        return `${value}`;
    }
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./Stock_data_vol.csv").then(function(stockData) {

    console.log(stockData);

    // parse data
    stockData.forEach(function(data) {
        // data.stock_name = +data.stock_name;
        // data.stock_symbol = +data.stock_symbol;
        data.stock_price = +data.stock_price;
        data.stock_volume = +data.stock_volume;
        
        /*data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;*/
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(stockData, chosenXAxis);
    var yLinearScale = yScale(stockData, chosenYAxis);

    //create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis//
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stockData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 14)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    //append initial text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(stockData)
        .enter()
        .append("text")        
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "8px")
        // .attr("color", "black")
        .text(function(d) { return d.stock_symbol });

     

    //create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var priceLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "stock_price")
        .text("stock_price ($)");

    //create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var volumeLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 80)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "stock_volume")
        .text("stock_volume (q)");

});
