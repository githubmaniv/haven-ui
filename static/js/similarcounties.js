// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth



function refreshSimilarCounties(job,edu,health,col,traffic,safety)
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


function countyclicked(d) {
    //alert(d.id)
    console.log(d)
    //alert(d.properties.name);
    //document.getElementById('zillow').src='https://www.trulia.com/'
    window.open("https://www.zillow.com/homes/"+d.properties.name+'-county');
        //'https://www.redfin.com/county/2362/PA/Allegheny-County'
        //='https://www.zillow.com/homes/'+d.properties.name+'-county'

}
