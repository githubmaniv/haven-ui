// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth



function refreshChloropeth(job,edu,health,col,traffic,safety)
{
    console.log(d3.version)
    d3.json("json/counties-albers-10m.json")
        .then(function(us) {
            // Code from your callback goes here...
            console.log('this works')

            //index_denominator=((Number(job)+Number(edu)+Number(health)+Number(col)+Number(traffic)+Number(safety))/6)*6
            index_denominator= ((Number(job)+Number(edu)+Number(health)+Number(col)+Number(traffic)+Number(safety))/6)*6
            console.log("index_denominator");
            console.log(index_denominator)
            job_weight=Number(job)/index_denominator
            console.log((job_weight))
            edu_weight=Number(edu)/index_denominator
            health_weight=Number(health)/index_denominator
            col_weight=Number(col)/index_denominator
            traffic_weight=Number(traffic)/index_denominator
            safety_weight=Number(safety)/index_denominator
            usa=us
            states = topojson.feature(us, us.objects.states)
            counties = topojson.feature(us, us.objects.counties)
            statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
            statemap = new Map(states.features.map(d => [d.id, d]))

            qry='job='+job_weight+'&edu='+edu_weight+'&health='+health_weight+'&col='+col_weight+'&traffic='+traffic_weight+'&safety='+safety_weight

            d3.json('/search-county?'+qry)
                .then(function(data){
                    console.log(data)
                    sortedFoods = data.slice().sort((a, b) => d3.descending(a.rate, b.rate)).slice(0,10)

                    console.log(sortedFoods)

                    $('#results-table').bootstrapTable({data: sortedFoods})
                    $('#results-table').bootstrapTable('load', sortedFoods);

                    console.log("about to execute visual")

                    chart=  Choropleth(data,{
                        id: d => d.id,
                        value: d => d.rate,
                        scale: d3.scaleQuantize,
                        domain: [1, 100],
                        range: d3.schemeBlues[9],
                        title: (f, d) => `${f.properties.name}, ${statemap.get(f.id.slice(0, 2)).properties.name}\n${d?.rate}%`,
                        features: counties,
                        borders: statemesh,
                        width: 975,
                        height: 610
                    })
                    // console.log(chart)
                    if (document.getElementById("chart"))
                    {
                        document.getElementById("chart").remove()
                    }

                    document.getElementById("observablehq-chart").appendChild(chart)
                })
                .catch(function(error){
                    console.log(error)
                })
        })
        .catch(function(error) {
            // Do some error handling.
            console.log(error)
        });
}







function Choropleth(data,{
    id = d => d.id, // given d in data, returns the feature id
    value = () => undefined, // given d in data, returns the quantitative value
    title, // given a feature f and possibly a datum d, returns the hover text
    format, // optional format specifier for the title
    scale = d3.scaleSequential, // type of color scale
    domain, // [min, max] values; input of color scale
    range = d3.interpolateBlues, // output of color scale
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    projection, // a D3 projection; null for pre-projected geometry
    features, // a GeoJSON feature collection
    featureId = d => d.id, // given a feature, returns its id
    borders, // a GeoJSON object for stroking borders
    outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
    unknown = "#ccc", // fill color for missing data
    fill = "white", // fill color for outline
    stroke = "white", // stroke color for borders
    strokeLinecap = "round", // stroke line cap for borders
    strokeLinejoin = "round", // stroke line join for borders
    strokeWidth, // stroke width for borders
    strokeOpacity, // stroke opacity for borders
} = {}) {
    // Compute values.
    const N = d3.map(data, id);
    const V = d3.map(data, value).map(d => d == null ? NaN : +d);
    const Im = new d3.InternMap(N.map((id, i) => [id, i]));

    const If = d3.map(features.features, featureId);

    //console.log(d3.version())

    // Compute default domains.
    if (domain === undefined) domain = d3.extent(V);

    // Construct scales.
    const color = scale(domain, range);
    if (color.unknown && unknown !== undefined) color.unknown(unknown);

    // Compute titles.
    if (title === undefined) {
        format = color.tickFormat(100, format);
        title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
    } else if (title !== null) {
        const T = title;
        const O = d3.map(data, d => d);
        title = (f, i) => T(f, O[i]);
    }

    // Compute the default height. If an outline object is specified, scale the projection to fit
    // the width, and then compute the corresponding height.
    if (height === undefined) {
        if (outline === undefined) {
            height = 400;
        } else {
            const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
            const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
            projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
            height = dy;
        }
    }

    // Construct a path generator.
    const path = d3.geoPath(projection);

    svg = d3.create("svg")
        .attr("id","chart")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "width: 100%; height: auto; height: intrinsic;");

    if (outline != null) svg.append("path")
        .attr("fill", fill)
        .attr("stroke", "currentColor")
        .attr("d", path(outline))

    svg.append("g")
        .selectAll("path")
        .data(features.features)
        .join("path")
        .attr("fill", (d, i) => color(V[Im.get(If[i])]))
        .attr("d", path)
        .on("click",(d,i)=>countyclicked(i))
        .append("title")
        .text((d, i) => title(d, Im.get(If[i])))



    if (borders != null) svg.append("path")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", path(borders))


    return Object.assign(svg.node(), {scales: {color}});
}
function countyclicked(d) {
    //alert(d.id)
    console.log(d)
    //alert(d.properties.name);
    //document.getElementById('zillow').src='https://www.trulia.com/'
    window.open("https://www.zillow.com/homes/"+d.properties.name+'-county');
        //'https://www.redfin.com/county/2362/PA/Allegheny-County'
        //='https://www.zillow.com/homes/'+d.properties.name+'-county'

}
