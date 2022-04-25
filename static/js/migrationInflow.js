// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth



function Choropleth_migration(data,{
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
        .attr("id","chart3")
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
        .on("click", (d,i) => show_migration(i))
        //.on("mouseout", (d,i) => refreshChloropeth_migration_pass)
        //.on("mouseout",(d,i)=>refreshChloropeth_searchmap)
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


function show_migration(clicked_county) {

    console.log(clicked_county)

    if (clicked_county === null) {
        var selid = '23003'
    } else {
       var selid=clicked_county.id
    }

    d3.json('/get-county-info?id=' + selid)
        .then(function (cnty_data) {


        d3.json("json/counties-albers-10m.json")
            .then(function (us) {
                // Code from your callback goes here...
                console.log('DLM: Building Query')

                qry = 'clicked_county=' + selid
                console.log(cnty_data)
                d3.select('#text_migration').text('Migration To ' + cnty_data[0].county + ', ' + cnty_data[0].state);
                d3.json('/migration-by-county?' + qry)
                    .then(function (data) {
                        console.log(data)

                        var maxy = d3.max(data, function (d) {
                            return d.value;
                        });

                        $('#mig-results-table').bootstrapTable({data: data})
                        $('#mig-results-table').bootstrapTable('load', data);



                        chart = Choropleth_migration(data, {
                            id: d => d.target,
                            value: d => Math.round(d.value),
                            scale: d3.scaleQuantize,
                            domain: [1, maxy],
                            range: d3.schemeReds[5],
                            // DLM: format this and add more data
                            title: (f, d) => `${f.properties.name}, ${statemap.get(f.id.slice(0, 2)).properties.name}\n${d?.value}`,
                            features: counties,
                            borders: statemesh,
                            width: 975,
                            height: 610
                        })
                        if (document.getElementById("chart3")) {
                            document.getElementById("chart3").remove()
                        }

                        legend =Legend(d3.scaleQuantize([1, maxy], d3.schemeReds[5]), "legend1", {
                            title: "Score"
                        })
                        //console.log(legend)
                        if (document.getElementById("legend1")) {
                           document.getElementById("legend1").remove()
                        }
                        document.getElementById("map-migration").appendChild(legend)

                        document.getElementById("map-migration").appendChild(chart)



                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            })
            .catch(function (error) {
                // Do some error handling.
                console.log(error)
            });
    })
    .catch(function (error) {
        // Do some error handling.
        console.log(error)
    });
}





