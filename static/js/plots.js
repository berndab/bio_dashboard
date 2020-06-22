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
            
            // Append a table row HTML elemement
            // to the table body element 
            tr = tbody.append("tr");
            
            // If the name value pair IS NOT location
            // information or ethnicity information, 
            // populate the HTML table row with the 
            // name value pair's field name in cell 1 
            // and the field value in cell 2
            if (nameValuePair[0] !== "location" && nameValuePair[0] !== "ethnicity") {
               
                // Append a table cell element to the
                // table row element with the field name
                // with the first letter of the name capitalized
                tr.append("td").text(nameValuePair[0].substring(0,1).toUpperCase() + nameValuePair[0].substring(1));

                // Append a table cell element to the
                // table row element with the field value
                tr.append("td").text(nameValuePair[1] !== null && nameValuePair[1]  !== undefined ?nameValuePair[1]:"");
            }
            // Some ethnicity properties contain 2 ethnicities such as Caucasian/Asian
            else if (nameValuePair[0] === "ethnicity"){

                // Append a table cell element to the
                // table row element with the field name
                // with the first letter of the name capitalized
                tr.append("td").text(nameValuePair[0].substring(0,1).toUpperCase() + nameValuePair[0].substring(1));

                // Append a table cell element to the
                // table row element with the ethnicity 
                // field value. Replace the "/"" character
                // for values with multiple ethnicities 
                // with an HTML <br/> element.
                if (nameValuePair[1] === null && nameValuePair[1]  === undefined ){
                    return;
                }

                let ethnicityArray = nameValuePair[1].split("\/");

                tr.append("td").text(ethnicityArray[0]);

                if(ethnicityArray.length > 1){

                    tr = tbody.append("tr");
                    tr.append("td")
                    tr.append("td").text(ethnicityArray[1]);        

                }
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
                let locationArray;

                if (nameValuePair[1] === null || nameValuePair[1] === undefined) {
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
                    state = locationArray[1];;
                }

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

        // Create the bar chart of the top 10 bacteria by count
        buildBarChartTop10(sampleData);

        // get the sample id's metadata
        let sampleMetadata = data.metadata.filter((sampleMetadata) => sampleMetadata.id == sampleId)[0];
 
        // Create the gauge chart of the wash frequency
        buildGuageChartWashFreq(sampleMetadata.wfreq);

        // Create bubble chart of the bacteria distribution
        buildBubbleChartBactDist(sampleData);

    });

    function buildBarChartTop10(sampleData) {

        //The sample data is sorted in decending order
        //Get the top 10 sample values in decending order
        let top10SampleValues  = sampleData.sample_values.slice(0,10).reverse();

        // Get the OTU ids for the top 10 sample values
        let top10OtuIds        = sampleData.otu_ids.slice(0,10).reverse().map(function(otu_id){

                                            let otu_id_str = otu_id.toString();
            
                                            if (otu_id_str.length !== 4){
                                                otu_id_str =  otu_id_str.length === 2?"    " + otu_id_str:"  " + otu_id_str;

                                            }
            
                                            return "OTU Id " + otu_id_str + " ";
                                        });

        // Get the OTU lables for the to 10 sample values
        // Replace the ";" in the sample OTU labels with a <br/> element
        // This make the display of the OTU labels more readable
        let top10OtuLabels     = sampleData.otu_labels.slice(0,10).reverse().map((otu_label) => otu_label.replace(/;/g, "</br>"));
        

        // Create bar chart
        let trace = {
           x: top10SampleValues,
           y: top10OtuIds,
           text: top10OtuLabels,
           type: "bar",
           orientation: "h",
           marker: { color: "#292b2c" }
        };

        let data = [trace];

        let layout = {
            xaxis: {title: "Sample Count"},
            yaxis: {title: "OTU Id"},
            margin: {l: 110}
        };

        Plotly.newPlot("bar", data, layout);     
    }

    function buildGuageChartWashFreq(wfreq){

        let pointerLocation = Math.floor(wfreq);

        // Trig to calc meter point
        var degrees = 180 - 10 - (pointerLocation * 20),
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
        // Path: may have to change to create a better triangle
        var mainPath = path1,
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = 
        [
            {
                type: 'scatter',
                x: [0],
                y:[0],
                marker: {size: 14, color:'850000'},
                showlegend: false,
                name: 'Wash Frequence',
                text: wfreq,
                hoverinfo: 'text+name'
            },
            { 
                values: [1,1,1,1,1,1,1,1,1,9],
                rotation: 90,
                text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
                labels : ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
                textinfo: 'text',
                textposition:'inside',
                marker: {
                            colors:
                            [
                                'rgba(000, 050, 000,  0.5)'
                                ,'rgba(000, 100, 000,  0.5)'
                                ,'rgba(000, 150, 000,  0.5)'
                                ,'rgba(050, 210, 050,  0.5)'
                                ,'rgba(075, 240, 075,  0.5)'
                                ,'rgba(125, 230, 125,  0.5)'
                                ,'rgba(225, 225, 110,  0.5)'
                                ,'rgba(255, 255, 150,  0.5)'
                                ,'rgba(255, 255, 204,  0.5)'
                                ,'rgba(255, 255, 255,  0.5)'
                            ]
                        },
                hoverinfo: 'label',
                hole: .5,
                type: 'pie',
                showlegend: false
             }
        ];

        var layout = 
        {
            shapes:
            [
                {
                    type: 'path',
                    path: path,
                    fillcolor: '850000',
                    line: {color: '850000'}
                }
            ],
            title: "Scrubs Per Week",
            height: 400,
            width: 400,
            xaxis: {zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]},
            yaxis: {zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]}
        };

        Plotly.newPlot('gauge', data, layout);        
    }

    function buildBubbleChartBactDist(sampleData){
        

        // Create a buble chart sample counts by OTU ids
        var trace = {
            x: sampleData.otu_ids,
            y: sampleData.sample_values,

            // Replace the ";" in the sample OTU labels with a <br/> element
            // This make the display of the OTU labels more readable
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
            showlegend: false,
            xaxis: {title: "OTU Id"},
            yaxis: {title: "Sample Count"},
        };
        
        Plotly.newPlot('bubble', data, layout);
    }

}