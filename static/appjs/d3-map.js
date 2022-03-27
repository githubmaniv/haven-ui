//Width and height of map
var width = 960;
var height = 800;

var outerRadius = Math.min(width, height, 500)/2,
    innerRadius = outerRadius * 0.4;


// D3 Projection
var projection = d3.geo.albersUsa()
    .translate([width/2, height/3])    // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

//Create SVG element and append map to the SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load in my states data!
d3.csv("stateslived.csv", function(data) {
    color.domain([0,1,2,3]); // setting the range of the input data

// Load GeoJSON data and merge with states data
    d3.json("us-states.json", function(json) {

// Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].state;

            // Grab data value
            var dataValue = data[i].visited;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++)  {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    // Copy the data value into the JSON
                    json.features[j].properties.visited = dataValue;

                    // Stop looking through the JSON
                    break;
                }
            }
        }

// Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) {

                // Get data value
                var value = d.properties.visited;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "rgb(213,222,217)";
                }
            });


// Map the cities I have lived in!
// d3.csv("cities-lived.csv", function(data) {

//     svg.selectAll("c") //this is
//     .data(data)
//     .enter()
//     .append("circle")
//     .attr("cx", function(d) {
//         return projection([d.lon, d.lat])[0];
//     })
//     .attr("cy", function(d) {
//         return projection([d.lon, d.lat])[1];
//     })
//     .attr("r", function(d) {
//         return Math.sqrt(d.years) * 2; //radius mod
//     })
//     .attr("fill", "rgb(217,91,67)")
//     .attr("opacity", 0.85)



//     // var outerCircle = svg.append("circle")
//     // .attr("cx", function(d) {
//     //     return projection([d.lon, d.lat])[0];
//     // })
//     // .attr("cy", function(d) {
//     //     return projection([d.lon, d.lat])[1];
//     // })
//     // .attr("r", function(d) {
//     //     return Math.sqrt(d.years) * 2; //radius mod
//     // })
//     // fill: "none",
//     // stroke: "black"
//     // });


//     // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
//     // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
//     .on("mouseover", function(d) {
//         div.transition()
//            .duration(200)
//            .style("opacity", .9);
//            div.text(d.place)
//            .style("left", (d3.event.pageX) + "px")
//            .style("top", (d3.event.pageY - 28) + "px");
//     })

//     // fade out tooltip on mouse out
//     .on("mouseout", function(d) {
//         div.transition()
//            .duration(500)
//            .style("opacity", 0);
//     });
// });

        d3.csv("cities-lived.csv", function(data) {

            var colorScale = d3.scale.linear()
                .domain([-15, 7.5, 30])
                .range(["#2c7bb6", "#ffff8c", "#d7191c"])
                .interpolate(d3.interpolateHcl)

            var circles1 = svg.selectAll("foo")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("r", function(d) {
                    return Math.sqrt(d.years * 2);
                })
                .style("fill", function(d) {
                    return colorScale(d.temp);
                })
                // .style("fill", "rgb(217,91,67)")
                .style("opacity", 0.85)

                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.text(d.place)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })

                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })

            var circles2 = svg.selectAll("foo")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("r", function(d) {
                    return Math.sqrt(d.avg * 2);
                })
                .style("fill", "none")
                .style("opacity", 0.85)
                .style("stroke", "black")
                .style("stroke-width", "2");

            // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
            // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

        });


///////////////////////////////////////////////////////////////////////////
//////////////// Create the gradient for the legend ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Extra scale since the color scale is interpolated
        var tempScale = d3.scale.linear()
            .domain([-15, 30])
            .range([0, width]);

        var colorScale = d3.scale.linear()
            .domain([-15, 7.5, 30])
            .range(["#2c7bb6", "#ffff8c", "#d7191c"])
            .interpolate(d3.interpolateHcl);

//Calculate the variables for the temp gradient
        var numStops = 10;
        tempRange = tempScale.domain();
        tempRange[2] = tempRange[1] - tempRange[0];
        tempPoint = [];
        for(var i = 0; i < numStops; i++) {
            tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
        }//for i

//Create the gradient
        svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-weather")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%")
            .selectAll("stop")
            .data(d3.range(numStops))
            .enter().append("stop")
            .attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })
            .attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });
/////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the legend ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

        var legendWidth = 400;

//Color Legend container
        var legendsvg = svg.append("g")
            .attr("class", "legendWrapper")
            .attr("transform", "translate(" + 250 + "," + ( 550) + ")");


//Draw the Rectangle
        legendsvg.append("rect")
            .attr("class", "legendRect")
            // .attr("x", -legendWidth/2)
            .attr("y", 0)
            .attr("rx", 8/2)
            .attr("width", legendWidth)
            .attr("height", 8)
            .style("fill", "url(#legend-weather)");

//Append title
        legendsvg.append("text")
            .attr("class", "legendTitle")
            .attr("x", 135)
            .attr("y", -10)
            // .style("text-anchor", "middle")
            .text("Average Daily Temperature");

//Set scale for x-axis
        var xScale = d3.scale.linear()
            .range([0, legendWidth])
            .domain([-15,30] );

//Define x-axis
        var xAxis = d3.svg.axis()
            .orient("bottom")
            .ticks(5)
            .tickFormat(function(d) { return d + "°C"; })
            .scale(xScale);

//Set up X axis
        legendsvg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (10) + ")")
            .call(xAxis);


// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
// var legend = d3.select("body").append("svg")
//                 .attr("class", "legend")
//                 .attr("width", 140)
//                 .attr("height", 200)
//                 .selectAll("g")
//                 .data(color.domain().slice().reverse())
//                 .enter()
//                 .append("g")
//                 .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//     legend.append("rect")
//           .attr("width", 18)
//           .attr("height", 18)
//           .style("fill", color);

//     legend.append("text")
//           .data(legendText)
//           .attr("x", 24)
//           .attr("y", 9)
//           .attr("dy", ".35em")
//           .text(function(d) { return d; });
    });

});
