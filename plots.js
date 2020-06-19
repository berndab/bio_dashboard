function init() {

    var selector = d3.select("#selDataset");

    d3.json("samples.json").then((data) => {

        console.log(data);
        
        var sampleids = data.names;

        sampleids.forEach((sampleId) => {
            selector
            .append("option")
            .text(sampleId)
            .property("value", sampleId);
        });

        optionChanged(sampleids[0]);

        selector._groups[0][0].selected = true;

    });
}

init();


function optionChanged(selectedSampleId) {
    buildMetadata(selectedSampleId);
    buildCharts(selectedSampleId);
}


function buildMetadata(sampleId) {

    d3.json("samples.json").then((data) => {
        var metadataArray = data.metadata;
        var sampleMetadata = metadataArray.filter((sampleMetadata) => sampleMetadata.id == sampleId)[0];
        var tbody = d3.select("#sample-metadata");
        var tr;
        
        tbody.html("");
        Object.entries(sampleMetadata).forEach((nameValuePair) => {
            tr = tbody.append("tr");
            tr.append("td").text(nameValuePair[0]);
            tr.append("td").text(nameValuePair[1]);
        }); 
    });

}

function buildCharts(sampleId){

    d3.json("samples.json").then((data) => {

        var samplesArray = data.samples;
        var sample       = samplesArray.filter((sample) => sample.id == sampleId)[0];

        buildBarChart(sample);

        buildGuageChart();

        buildBubbleChart(sample);

    });

    function buildBarChart(sample) {

        var sortSampleVals  = sample.sample_values.sort((a, b) => {a - b});
        var sortSampleVals  = sortSampleVals.slice(0,10);
        var sortSampleIndex = 0;

        var otu_id_labels = new Array();
        
        for (samplesIndex = 0; samplesIndex < sample.sample_values.length; samplesIndex++){

            if (sortSampleVals[sortSampleIndex] === sample.sample_values[samplesIndex]){
                
                otu_id_labels.push( "OTU Id " + sample.otu_ids[sortSampleIndex] + " ");
                
                sortSampleIndex++;
                
                if (sortSampleIndex === 10){
                    break;
                }
            }
        }

        var trace = {
           x: sortSampleVals,
           y: otu_id_labels,
           type: "bar",
           orientation: "h"
        };

        var data = [trace];

        var layout = {
            title: "Top 10 Bacteria Species Found",
            xaxis: {title: "Sample Count"},
            yaxis: {title: "OTU Id"},
        };

        Plotly.newPlot("bar", data, layout);     
    }

    function buildGuageChart(){
        var data = [
            {
                domain: { x: [0, 1], y: [0, 1] },
                value: 270,
                title: { text: "Speed" },
                type: "indicator",
                mode: "gauge+number"
            }
        ];
        
        var layout = { 
            width: 500, 
            height: 500, 
            margin: { t: 0, b: 0 }
        };

        Plotly.newPlot('gauge', data, layout);        
    }

    function buildBubbleChart(sample){

        var trace = {
            x: sample.otu_ids,
            y: sample.sample_values,
            text: sample.otu_labels.map((otu_label) => otu_label.replace(/;/g, "</br>")),
            mode: 'markers',
            marker: {
                size: sample.sample_values,
                sizemode: 'area'
            }
        };
  
        var data = [trace];
        
        var layout = {
            title: 'Bacteria Distribution',
            showlegend: false,
            height: 600,
            width: 600
        };
        
        Plotly.newPlot('bubble', data, layout);
    }

}