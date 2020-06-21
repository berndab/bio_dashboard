// Function to populate the webpage
// Populate the options of the sample id
// select control with one poption for 
// each sample id
function init() {

    // Reference to sample id select control
    let selectControl = d3.select("#selDataset");

    // Load the data files
    d3.json("samples.json").then((data) => {
        
        //Get the sample ids from
        //the data file
        let sampleids = data.names;

        // For each sample id number
        // create a select control option
        sampleids.forEach((sampleId) => {
            selectControl
            .append("option")                     // Create an option
            .text(sampleId)                       // Set the  option text to the sample id
            .attr("value", sampleId)              // Set option value to the sample id
            .attr("class", "bg-dark text-white"); //Set the option CSS cl

        });

        // Select the first sample it option
        selectControl._groups[0][0].selected = true;

        // Display the data for the first sample id
        optionChanged(sampleids[0]);


    });
}


// Initalize the webpage
init();



// Function to handle the on change event
// for the sample id select control
function optionChanged(selectedSampleId) {
    buildMetadata(selectedSampleId);
    buildCharts(selectedSampleId);
}

// This variable holds a reference to the the table 
// body element of the HTML table that displays the 
// the selected sample id metadata.
//
// A global variable is used to hold the reference
// to the tbody element because it it is more
// efficient to only get the reference once. It 
// does not need to be selected each time a new
// sample id is selected in the select control. 
let tbody = d3.select("#sample-metadata");


// This function populates the sample id's
// metadata information in the metadata 
// sections of the webpage
function buildMetadata(sampleId) {

    // Load the data
    d3.json("samples.json").then((data) => {

        // Get the metadata object
        let metadataArray = data.metadata;

        // Get the sample id's metadata
        let sampleMetadata = metadataArray.filter((sampleMetadata) => sampleMetadata.id == sampleId)[0];

        // Clear the table body
        // or the metadata HTML table
        tbody.html("");

        // Populates the sample id's metatdata
        // in the dashboard's HTML metadata table
        // The metadata data structure is an 
        // a array of data arrays. Each data
        // array contains a name value pair's 
        // field name at location 0 and the field 
        // value at location 1
        Object.entries(sampleMetadata).forEach((nameValuePair) => {
            
            
            // If the name value pair IS NOT location
            // information, populate the HTML table row
            // with the name value pair's field name in 
            // cell 1 and the field value in cell 2
            if (nameValuePair[0] !== "location") {

                // Append a table row HTML elemement
                // to the table body element 
                tr = tbody.append("tr");
                
                // Append a table cell element to the
                // table row element with the field name
                tr.append("td").text(nameValuePair[0].substring(0,1).toUpperCase() + nameValuePair[0].substring(1));

                 // Append a table cell element to the
                // table row element with the field value
                tr.append("td").text(nameValuePair[1] !== null && nameValuePair[1]  !== undefined?nameValuePair[1]:"");
            }

            // If the name value pair IS location information, set the 
            // name value pair's field value to the variable location. 
            // Split the location variable into city name and state name. 
            // Create the first table row with the string 'City' in cell 1 
            // and the city name, location[0] in cell 2. Ceate a second 
            // table row with the string 'State' in cell one and the state
            // name in cell 2.  
            else {

                let city;
                let state;
                let locationArray

                if (location[1] === null || location[1] === undefined) {
                    city = "";
                    state = "";
                }
                else if ((locationArray = nameValuePair[1].split(/\/|,/)).length === 1){
                    if (locationArray[0].length > 2 ){
                        city  = locationArray[0];
                        state = "";
                    }
                    else {
                        city  = "";
                        state = locationArray[0];
                    }
                }
                else {
                    city  = locationArray[0];
                    state = locationArray[0];;
                }

                tr = tbody.append("tr");
                tr.append("td").text("City")
                tr.append("td").text(city);

                tr = tbody.append("tr");
                tr.append("td").text("State")
                tr.append("td").text(state);


            }
        }); 
    });

}

// Function that load the data file
// into a data object, gets the 
// sample id's sample data. The 
// function passes the sample id's
// sample data to the individual
// build chart functions.
function buildCharts(sampleId){

    // Loads the data file into the data object
    d3.json("samples.json").then((data) => {

        // Gets the sample id's sample data from data object
        let sampleData  = data.samples.filter((sampleData) => sampleData.id == sampleId)[0];

        // Create the bar chart 
        buildBarChartTop10(sampleData);

        // Create the gauge chart
        buildGuageChartWashFreq();

        // Create bubble chart
        buildBubbleChartBactDist(sampleData);

    });

    function buildBarChartTop10(sampleData) {

        let top10SampleValues  = sampleData.sample_values.slice(0,10).reverse();
        let top10OtuIds        = sampleData.otu_ids.slice(0,10).reverse().map(function(otu_id){

                                            let otu_id_str = otu_id.toString();
            
                                            if (otu_id_str.length !== 4){
                                                otu_id_str =  otu_id_str.length === 2?"    " + otu_id_str:"  " + otu_id_str;

                                            }
            
                                            return "OTU Id " + otu_id_str + " ";
                                        });
        let top10OtuLabels     = sampleData.otu_labels.slice(0,10).reverse().map((otu_label) => otu_label.replace(/;/g, "</br>"));
    
        let trace = {
           x: top10SampleValues,
           y: top10OtuIds,
           text: top10OtuLabels,
           type: "bar",
           orientation: "h",
           marker: { color: "#6c757d" }
        };

        let data = [trace];

        let layout = {
            //title: "Top 10 Bacteria Species Found",
            xaxis: {title: "Sample Count"},
            yaxis: {title: "OTU Id"},
            margin: {l: 110}
        };

        Plotly.newPlot("bar", data, layout);     
    }

    function buildGuageChartWashFreq(){

        //let path = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L `X` `Y` Z' : 'M -0.025 -0.0 L 0.025 0.0 L `X` `Y` Z'
// Enter a speed between 0 and 180
let level = 90;

// Trig to calc meter point
let degrees = 180 - level,
     radius = .5;
let radians = degrees * Math.PI / 180;
let x = radius * Math.cos(radians);
let y = radius * Math.sin(radians);
let path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
// Path: may have to change to create a better triangle
let mainPath = path1,
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
let path = mainPath.concat(pathX,space,pathY,pathEnd);




        let data = [
            {   
                type: 'scatter',
                x: [0], 
                y:[0],
                marker: {size: 14, color:'850000'},
                showlegend: false,
                name: 'speed',
                text: level,
                hoverinfo: 'text+name'
            },
            {
                values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
                text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", ""],
                textinfo: "text",
                textposition: "inside",
                showlegend: false,
                marker: 
                {
                    colors: 
                    [
                        "rgba( 14, 127,   0, .5)",
                        "rgba(110, 154,  22, .5)",
                        "rgba(170, 202,  42, .5)",
                        "rgba(202, 209,  95, .5)",
                        "rgba(210, 206, 145, .5)",
                        "rgba(232, 226, 202, .5)",
                        "rgba(242, 236, 202, .5)",
                        "rgba(252, 246, 212, .5)",
                        "rgba(255, 255, 212, .5)",
                        "rgba(255, 255, 255, .5)"
                    ]
                },
                rotation: 90,
                margin: { l: 0, r: 0, b: 0, t: 0, pad: 0},
                hole: .5,
                autosize: false,
                 
                type: 'pie'
        }];

        let layout = {
            height: 450,
            width: 420
        };

        Plotly.newPlot('gauge', data, layout);        
    }

    function buildBubbleChartBactDist(sampleData){
        
        var trace = {
            x: sampleData.otu_ids,
            y: sampleData.sample_values,
            text: sampleData.otu_labels.map((otu_label) => otu_label.replace(/;/g, "</br>")),
            mode: 'markers',
            marker: {
                size: sampleData.sample_values.map((values) => values * 10),
                sizemode: 'area',
                color: sampleData.otu_ids,
                colorscale: 'Picnic'
            }
        };
  
        let data = [trace];
        
        let layout = {
            //title: 'Bacteria Distribution',
            showlegend: false,
            xaxis: {title: "OTU Id"},
            yaxis: {title: "Sample Count"},
        };
        
        Plotly.newPlot('bubble', data, layout);
    }

}