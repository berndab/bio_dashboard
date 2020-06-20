function init() {

    var selector = d3.select("#selDataset");

    d3.json("samples.json").then((data) => {

        console.log(data);
        
        var sampleids = data.names;

        sampleids.forEach((sampleId) => {
            selector
            .append("option")
            .text(sampleId)
            .attr("value", sampleId)
            .attr("class", "bg-dark text-white");

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

var tbody = d3.select("#sample-metadata");

function buildMetadata(sampleId) {

    d3.json("samples.json").then((data) => {
        var metadataArray = data.metadata;
        var sampleMetadata = metadataArray.filter((sampleMetadata) => sampleMetadata.id == sampleId)[0];
        var location;

        tbody.html("");
        Object.entries(sampleMetadata).forEach((nameValuePair) => {
            
            if (nameValuePair[0] !== "location") {
                tr = tbody.append("tr");
                tr.append("td").text(nameValuePair[0].substring(0,1).toUpperCase() + nameValuePair[0].substring(1))
                tr.append("td").text(nameValuePair[1]);
            }
            else {
                location = nameValuePair[1].split(/\/|,/);
                location[1] = location[1] !== undefined?location[1]:"";
                tr = tbody.append("tr");
                tr.append("td").text("City")
                tr.append("td").text(location[0]);
                tr = tbody.append("tr");
                tr.append("td").text("State")
                tr.append("td").text(location[1]);


            }
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

        var valuesSorted  = sample.sample_values.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
        var valuesSorted  = valuesSorted.slice(-10);
        var valuesSortedIndex = 0;

        var otu_ids = new Array();
        var otu_labels = new Array();
        
        for (sampleIndex = 0; sampleIndex < sample.sample_values.length; sampleIndex++){

            if (valuesSorted[valuesSortedIndex] === sample.sample_values[sampleIndex]){
                
                otu_ids.push( "OTU Id " + sample.otu_ids[sampleIndex] + " ");
                otu_labels.push(sample.otu_labels[sampleIndex].replace(/;/g, "</br>"));
                
                valuesSortedIndex++;
                
                if (valuesSortedIndex === 10){
                    break;
                }
            }
        }

        var trace = {
           x: valuesSorted,
           y: otu_ids,
           text: otu_labels,
           type: "bar",
           orientation: "h",
           marker: { color: "#6c757d" }
        };

        var data = [trace];

        var layout = {
            //title: "Top 10 Bacteria Species Found",
            xaxis: {title: "Sample Count"},
            yaxis: {title: "OTU Id"},
            margin: {l: 110}
        };

        Plotly.newPlot("bar", data, layout);     
    }

    function buildGuageChart(){

        var data = [{
                domain: { x: [0, 1], y: [0, 1] },
                value: 7,
                //title: { text: "Washing Frequency" },
                type: "indicator",
                mode: "gauge",
                marker: { color: "#6c757d" },
                steps: [
                    { range: [0, 1], color: "#e8e2ca" },
                    { range: [1, 2], color: "cyan" },
                    { range: [2, 3], color: "cyan" },
                    { range: [3, 4], color: "cyan" },
                    { range: [4, 5], color: "cyan" },
                    { range: [5, 6], color: "cyan" },
                    { range: [6, 7], color: "cyan" }]
        }];
        
        var layout = { 
            width: 400, 
            height: 400, 
            margin: { t: 0, b: 0 }
        };

        Plotly.newPlot('gauge', data, layout);        
    }

    function buildBubbleChart(sample){
        
        var colors = sample.otu_ids.map((value) => "'rgb("  + ( Math.round( ((value/3500)*255) ) ) + ", " + ( 255 - Math.round( ((value/3500)*255) ) ) + ","  + ( Math.round( ((value/3500)*255) ) ) + ")'");
        
        var trace = {
            x: sample.otu_ids,
            y: sample.sample_values,
            text: sample.otu_labels.map((otu_label) => otu_label.replace(/;/g, "</br>")),
            mode: 'markers',
            marker: {
                size: sample.sample_values.map((values) => values * 10),
                sizemode: 'area',
                color: colors
            }
        };
  
        var data = [trace];
        
        var layout = {
            //title: 'Bacteria Distribution',
            showlegend: false,
            xaxis: {title: "OTU Id"},
            yaxis: {title: "Sample Count"},
        };
        
        Plotly.newPlot('bubble', data, layout);
    }

}