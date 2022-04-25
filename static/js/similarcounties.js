// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/choropleth



function refreshSimilarCounties(job,edu,health,col,traffic,safety)
{
    console.log(d3.version)
    d3.json("json/counties-albers-10m.json")
        .then(function(us) {
            console.log('similar counties')

            usa=us
            states = topojson.feature(us, us.objects.states)
            counties = topojson.feature(us, us.objects.counties)
            statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
            statemap = new Map(states.features.map(d => [d.id, d]))

        //    qry='job='+job_weight+'&edu='+edu_weight+'&health='+health_weight+'&col='+col_weight+'&traffic='+traffic_weight+'&safety='+safety_weight
            //console.log(col,edu,traffic,health,job,safety)
            //console.log('col===on',col==='on')
            let qry='cluster_'
            if (col) qry=qry+'4_'

            if (edu) qry=qry+'5_'

            if (traffic) qry=qry+'6_'

            if (health) qry=qry+'7_'

            if (job) qry=qry+'8_'

            if (safety) qry=qry+'9_'

            qry=qry.substr(0,qry.length-1)
            if (qry==='cluster')  {qry='cluster_4_5_6_7_8_9'}

            d3.json('/search-similar-county?q='+qry)
                .then(function(data){
                    console.log(data)
                    //sortedFoods = data.slice().sort((a, b) => d3.descending(a.rate, b.rate)).slice(0,10)


                    $('#simi-results-table').bootstrapTable({data: data})
                    $('#simi-results-table').bootstrapTable('load', data);

                    //$('#results-table').bootstrapTable({data: sortedFoods})
                    //$('#results-table').bootstrapTable('load', sortedFoods);

                    console.log("about to execute visual")

                    chart=  Choropleth(data,{
                        chartId:'chart2',
                        id: d => d.id,
                        value: d => d.cluster_id,
                        scale: d3.scaleOrdinal,
                        domain: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
                        range: ["#C2B9BC", "#6E6B58","#C7B79D","#ABA082","#CFBDAE","#A64B52","#9A806A",
                            "#EAB8CE","#7B5E71","#803932","#733444","#A68446","#A68051","#F2CDAC",
                            "#A63737","#D87181","#3F3839","#F0CBBC","#CD3E2D","#DA8583","#580009",
                            "#A60121","#F42D64","#F03C7D","#455C01"],
                        title: (f, d) => `${f.properties.name}, ${statemap.get(f.id.slice(0, 2)).properties.name}\n${d?.cluster_id}`,
                        features: counties,
                        borders: statemesh,
                        width: 975,
                        height: 610
                    })
                    // console.log(chart)
                    if (document.getElementById("chart2"))
                    {
                        document.getElementById("chart2").remove()
                    }

                    legend =Legend(d3.scaleOrdinal([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
                        ["#C2B9BC", "#6E6B58","#C7B79D","#ABA082","#CFBDAE","#A64B52","#9A806A",
                            "#EAB8CE","#7B5E71","#803932","#733444","#A68446","#A68051","#F2CDAC",
                            "#A63737","#D87181","#3F3839","#F0CBBC","#CD3E2D","#DA8583","#580009",
                            "#A60121","#F42D64","#F03C7D","#455C01"]), "legend2", {
                            title: "Similarity ID"
                        })
                        //console.log(legend)
                        if (document.getElementById("legend2")) {
                           document.getElementById("legend2").remove()
                        }
                        document.getElementById("similarcounties-chart").appendChild(legend)

                    document.getElementById("similarcounties-chart").appendChild(chart)


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
