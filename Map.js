/* 
    Value: svg
    Purpose: This value is the map. It is set up as a width and height.
 */
var svg = d3.select("#Map"),
width = +svg.attr("width"),
height = +svg.attr("height");

var zoom = d3.zoom().scaleExtent([.75,9]).on('zoom',zoomed);
var zoomLimit = false;
/*
    sets default state in GUI of line render to be disabled tell arrrow render is also disabled (checked).
*/
document.getElementById("lines").disabled = true;

//choose the type of omap
/* 
    Value: projection
    Purpose: Controls the scale of the map.
 */
var projection = d3.geoAlbers()
//.translate(width / 2, height / 2)
.scale(1200)
//.translate([100, 162]);

/* 
    Value: margin
    Purpose: Select the type of graph that is used.
*/
var margin = d3.map();

/* 
    Value: path
    Purpose: Show the projection path of Map.
*/
var path = d3.geoPath()
.projection(projection)
.pointRadius(2.5);

/* 
    Value: color
    Purpose: Control the coloring of the map.
 */
var color = d3.scaleThreshold()
.domain(d3.range(2, 10))
.range(d3.schemeReds[9]);

//default settings (all checkboxes enabled)
document.getElementById('arrows').checked = true;
document.getElementById('lines').checked = true;
document.getElementById('Empties').checked = true;
document.getElementById('nameplate').checked = true;

/*
    Function: makeMap()
    Paramaters: None
    Return: None
    Description: This give function remove the old map on the web browers 
    and starts the propuse of creating a new map.
 */
function makeMap()
{
    if(!d3.selectAll("#Map").empty())
    {
        d3.select('#Map').selectAll("*").remove();
        d3.select('.d3-tip').remove();
    }

    d3.queue()
    .defer(d3.json, "https://gist.githubusercontent.com/anonymous/d0b530924ef2aae3436840a1dbb3a39f/raw/41b785524ea44f0e85268e4b554f51be2504a851/us.json")
    //.defer(d3.csv, "avgmargin2.csv", function(d) {margin.set(d.id, +d.rate);})
    .await(data);
    this.svg.call(this.zoom.transform, d3.zoomIdentity.scale(1));
}

function resetMap()
{
    this.svg.call(this.zoom.transform, d3.zoomIdentity.scale(1));
}

/*
    Function: downloadFile()
    Paramaters: None
    Return: Downloads a pdf file name Map.pdf
    Description: This functions finds the html div with ID of MapContainer. Then ture the html into a jpeg which is 
    download as a pdf with the file name as pdf.

 *///Note to self try with pic and just through see what happens
function downloadFile() 
{
    var element = this.document.getElementById("MapContainer").cloneNode(true);
    var title_node = this.document.getElementById("title").cloneNode(true);
    var pdf_Container = document.createElement('div');
    var date_node = document.createElement("p"); 
    
    var pdf_title = getLineFileName();

    if(pdf_title)
    {
        pdf_title = " " + pdf_title.replace(".csv", "");
        while(pdf_title.includes('_'))
        {
            pdf_title = pdf_title.replace("_", " ");
        }
    }
    else
        pdf_title = "";

    if(pdf_title)
        var date_text = document.createTextNode(pdf_title);
    else
        var date_text = document.createTextNode("");

    title_node.style.padding = "0";
    title_node.style.margin = "0";
    title_node.style.border = "none";
    title_node.style.top = "0";
    title_node.style.bottom = "0";

    date_node.appendChild(date_text);
    date_node.style.textAlign = "center";
    date_node.style.fontSize = "30px";
    date_node.style.padding = "0";
    date_node.style.margin = "0";

    element.style.textAlign = "center";
    element.style.margin = "0";
    element.style.padding = "0";

    pdf_Container.appendChild(title_node);
    pdf_Container.appendChild(element);
    pdf_Container.appendChild(date_node);
    pdf_Container.style.padding = "0";
    pdf_Container.style.margin = "0";
    pdf_Container.style.border = "none";
    pdf_Container.style.top = "0";
    pdf_Container.style.bottom = "0";
    
    const invoice = pdf_Container;

    var opt = {
        margin: 1,
        filename: 'Map' + pdf_title + '.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().from(invoice).set(opt).save();
}

/*
    function: checkboxAlert()
    returns: N/A
    Description: takes checkbox event of toggle arrow render in keymap function and enables checkbox
    to toggle render for lines if arrrow render has been disabled.
*/
function checkboxAlert(checkboxElem)
{
    if (checkboxElem.checked) {
        document.getElementById("lines").disabled = true;
    }
    else {
        document.getElementById("lines").disabled = false;
    }
}

/*
    Function: get_cities_data()
    Paramaters: None
    Return: Diractory of the cities of provide file.
    Description: Retieve the data of cities from the Read-cvs file.
 */
function get_cities_data()
{
    return getCities(); 
}

/*
    Function: get_lines_data
    Paramaters: None
    Return: Diractory of lines objects
    Description: Retieve the data of lines from the Read-cvs file.
 */
function get_lines_data()
{
    return getLines();
}

/*
    Function: draw_city
    Paramaters: cities
    Return: None
    Description: The function creates the cities display on map with a red dot base on the paramater of cities. 
    Then create a tool tip that display the details about a city that is hover over by the mouse at the bottem of the map.
 */
function draw_city(cities)
{
    //add up all outgoing empty freights to one sum
    //this outgoing empty freights number assumes that there is only a point A and point B, meaning
    //a shipment starts and ends at one city.
    var mydata = get_lines_data();
    var mycities = get_cities_data();
    var emptiesarray = [];
    var empties = 0;
    var i = 1;

    if(mydata)
    {
    //algorithm assumes that monthly csv file is in alphabetical order (how it has ben given) in the 'From' Column
    //creates a new array called emptiesarray to hold sumation of all empties from the "From" city column
   for (let x = 0; x <= mydata.length; x++)
   {   
        //console.log("x: " + mydata[x].From)
        //console.log("i: " + mydata[i].From)

        //last element of array check condition
        if(x >= mydata.length)
        {
            var temp = {From: mydata[x-1].From, Empties: empties}
            emptiesarray.push(temp)
            break;
        }
       else if (mydata[x].From == mydata[i].From)
       {
           empties = empties + parseInt(mydata[x].Empties)
       }
       else
       {       
            var temp = {From: mydata[i].From, Empties: empties}
            emptiesarray.push(temp)
            empties = 0;
            x--;
            i = x + 1;
            //console.log("x and i not same!")
       }
   }
   //console.log(emptiesarray)
   
   //loop through two arrays (cities.csv file and <month_report>.csv) to add TID and OutgoingEmpties to emptiesarray
   var city_plus_empties = [];
   var i = 0;
   for (let x = 0; x <= cities.length; x++)
   {   
        //assumes there is no city located in the monthly_report.csv that isn't already in cities.csv files
        if(x >= cities.length || i == emptiesarray.length) 
        {
            //I dont know why but the last element's TID is wrong unless I add this for loop and if statement
            for(let j = 0; j < cities.length; j++)
            {
                if(emptiesarray[i].From == cities[j].SVC)
                {
                    var temp1 = "[j].Lat."
                    var temp2 = "[j].Long."
                    var temp = {From: emptiesarray[i].From, TID: cities[j].TID, Lat: cities[temp1] ,Long: cities[temp2] , OutgoingEmpties: emptiesarray[i].Empties}
                    city_plus_empties.push(temp)
                   
                   mycities[j].outEmpties = emptiesarray[i].Empties

                    break;
                }
            }
            break;
        }
        else if(emptiesarray[i].From == cities[x].SVC && (i < emptiesarray.length-1))
        {
            var temp1 = "[x].Lat"
            var temp2 = "[x].Long"
            var temp = {From: emptiesarray[i].From, TID: cities[x].TID,  Lat: cities[temp1] ,Long: cities[temp2] , OutgoingEmpties: emptiesarray[i].Empties}
            city_plus_empties.push(temp)

           mycities[x].outEmpties = emptiesarray[i].Empties

            i++;
            x = 0; 
        }
   }
   //console.log(city_plus_empties)
   //console.log(mycities)

   //incoming Empties:
   var incomingarray = [];
   var incomingEmpties = 0;
   for(let x = 0; x < mydata.length; x++)
   {
       for(let i = 0; i < mydata.length; i++)
       {
           if(mydata[x].To == mydata[i].To)
           {
                incomingEmpties = incomingEmpties +  parseInt(mydata[i].Empties)
           }
       }
       var temp = {To: mydata[x].To,incomingEmpties: incomingEmpties}   //empties for that city matching the "To" column added up here
       incomingarray.push(temp)
       incomingEmpties = 0;
   }
   /*
   //clean up repeated entries
   for(let y = 0; y < incomingarray.length; y++)
   {
       for(let z = y+1; z < incomingarray.length; z++)
       {
           if(incomingarray[y].To == incomingarray[z].To)
           {
               incomingarray.splice(z,1)
           }
       }
   }
   console.log(incomingarray) //still has some dups... idk why
   */
    //console.log(incomingarray)
   //add incomingEmpties to mycities array
   for(let y = 0; y < mycities.length; y++)
   {
       for(let z = 0; z < incomingarray.length; z++)
       {
           if(mycities[y].SVC == incomingarray[z].To)
           {
               mycities[y].inEmpties = incomingarray[z].incomingEmpties
               break;
           }
       }
   }
    }
   //console.log(mycities)

    //new tooltip not using d3-tip library
    var tip2 = d3.select("#MapContainer")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("background-color", "black")
        .style("opacity", 0.8)
        .style("padding", "4px")

    //Keymap render toggle
    if((document.getElementById('nameplate').checked)){
        svg.selectAll('city_label')
            .data(cities).enter()
            .append('text')
            .attr("id", "city_name")
            .attr("x", function (d) {return projection([d['Long.'], d['Lat.']])[0]; })
            .attr("y", function (d) {return projection([d['Long.'], d['Lat.']])[1] - 3; })
            .attr('font-family', 'sans-serif')
            .attr('font-size', 7)
			.attr('font-weight', 800)
			.attr("stroke","white")
			.style('stroke-width', .25)
			//.attr('stroke-opacity', 1)
			.attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .text(function (d) {return d["SVC"]});
    }
       
    // creates dots at long and lat of the city
    var city_loc = svg.selectAll("city_loc")
        .data(cities).enter()
        .append("circle")
        .attr("cx", function (d) {return projection([d['Long.'], d['Lat.']])[0]; })
        .attr("cy", function (d) {return projection([d['Long.'], d['Lat.']])[1]; })
        .attr("r", 2)
        .attr("fill", "red")
        .on('mouseover', function(d){
            var output = ("<strong>City:</strong> <span style='color:grey'>" + d["SVC"] + "<br>"
            + "<span style='color:white'> <strong>TID: </strong>" + "<span style='color:grey'>" +  d["TID"] + "<BR>"
            +  "<span style='color:white'> <strong>Incoming Empties: </strong>"  + "<span style='color:grey'>" + d["inEmpties"] + "<BR>"
            + "<span style='color:white'> <strong>Outgoing Empties: </strong>" + "<span style='color:grey'>" + d["outEmpties"])
            tip2.html(d)  
            .style("left", (d3.event.pageX-64) + "px")     
            .style("top",  (d3.event.pageY-80) + "px")
            .style("visibility", "visible")
            .html(output)
            return;})
        .on("mouseout", function(){return tip2.style("visibility", "hidden");});
        svg.selectAll("city_loc")


    //svg.call(city_loc);
}

/*
    Function: draw_lines
    Paramaters: data
    Return: None
    Description: Creates the lines on the map. This is done base on the data provided.
 */
function draw_lines(data)
{
	//make sure if arrows box is checked, lines box is also checked
	if((document.getElementById('arrows').checked)){
		
		document.getElementById('lines').checked = true;
	}

    for(var count = 0; count < data.length; count++)
	{
		var from = projection([parseFloat(data[count]['Flong']), parseFloat(data[count]['Flat'])]);
		var to = projection([parseFloat(data[count]['Tlong']), parseFloat(data[count]['Tlat'])]);
		
        if((document.getElementById('lines').checked)){
            svg.selectAll('lines_city')
                .data(data)
                .enter()
                .append("path")
                .attr("id", `arrow${count}`)
                .attr("d", `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`)
                .attr("stroke", '#7D7D7D')//646464')
                .style("stroke-width", ".05px");
        }

        if((document.getElementById('arrows').checked && document.getElementById('lines').checked)){
            svg.append("text")
                .append("textPath")
                .attr("xlink:href", `#arrow${count}`)
                .style("dominant-baseline","central")
                .style("fill","blue")
                .style("font-size", "5px")
                .style("text-anchor","middle")
                .attr("startOffset", "50%")
                .text("➤");
        }

                
	}

    if((document.getElementById('Empties').checked))
    {
        svg.selectAll('Empty')
                .data(data).enter()
                .append('text')
                .attr("id", "empty_load")
                .attr("x", function (d) {return projection([parseFloat(d['Flong']) + (11/16)*(parseFloat(d['Tlong']) - parseFloat(d['Flong'])), parseFloat(d['Flat']) + (11/16)*(parseFloat(d['Tlat'] - parseFloat(d['Flat'])))])[0];})
                .attr("y", function (d) {return projection([parseFloat(d['Flong']) + (11/16)*(parseFloat(d['Tlong']) - parseFloat(d['Flong'])), parseFloat(d['Flat']) + (11/16)*(parseFloat(d['Tlat'] - parseFloat(d['Flat'])))])[1] + 1;})
                .attr('font-family', 'sans-serif')
				//.style("font-size", "10px")
                .attr('font-size', 6)
				.attr('font-weight', 900)
				.attr("stroke","white")
				.style('stroke-width', .25)
				.attr('stroke-opacity', 1)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .attr('fill-rule', 'evenodd')
                .text(function (d) {return d["Empties"]});
    }
}
    //Line
    //Keymap render toggle
    //currently disabling lines means arrows are not drawn as they are dependent on the lines. therefore, you have to toggle arrow and line render
    //for lines to not be rendered on the SVG.


/*
    Function: data()
    Paramaters: error, topo
    Return: None
    Description: Creates the the map and run the other function develop the map.
 */
function data(error, topo) 
{   
    var lines = get_lines_data();
    var cities = get_cities_data();
    var minLat;
    var maxLat;
    var minLong;
    var maxLong;
    var x
    var y 

    if(cities)
    {
        minLat = cities[0]['Lat.'];
        maxLat = cities[0]['Lat.'];
        minLong = cities[0]['Long.'];
        maxLong = cities[0]['Long.'];
        for(i = 1; i < cities.length; i++)
        {
            if(parseFloat(minLat) > parseFloat(cities[i]['Lat.']))
                minLat = cities[i]['Lat.']

            if(parseFloat(maxLat) < parseFloat(cities[i]['Lat.']))
                maxLat = cities[i]['Lat.']

            if(parseFloat(minLong) > parseFloat(cities[i]['Long.']))
                minLong = cities[i]['Long.']

            if(parseFloat(maxLong) < parseFloat(cities[i]['Long.']))
                maxLong = cities[i]['Long.']
        }
        
        x = (parseFloat(minLong) + parseFloat(maxLong))/2 + 100
        y = (parseFloat(minLat) + parseFloat(maxLat))/2 + 4.2
        window.projection.center([x,y])
    }
    else
    {
        window.projection.center([0,40])
    }

    //This is the part that draw the map create the circle, arrow, and lines.
    svg.append("g")
        //.attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(topo, topo.objects.counties).features)
        .enter()
        .append("path")
        //.attr("fill", function(d) {return color(d.rate = margin.get(d.id));})
        .attr("d", path)
        .attr("fill", "#ddd");
        //.text(function(d) {return d3.format("$,d")(d.rate * 2500);});

    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.counties, function(a, b) { return a !== b; }))
        .attr("fill", "#ddd")
        //.attr("class", "county-borders")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.states, function(a, b) { return a !== b; }))
        //.attr("class", "state-borders")
        .attr("fill", "#ddd")
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .attr("d", path);

    svg.call(zoom);
    
    if(lines)
    {
        draw_lines(lines);//data);
    }
    
    if(cities)
    {
        draw_city(cities);//cites);
    }

};

function zoomed()
{
    
    svg.selectAll('path').attr('transform',d3.event.transform);
    svg.selectAll('circle').attr('transform', d3.event.transform).attr("r", 2/d3.event.transform.k);//"translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");//
    //svg.selectAll('textPath').attr('transform',d3.event.transform);
    svg.selectAll('#city_name').attr('transform',d3.event.transform).attr('font-size', 8/d3.event.transform.k).style('stroke-width', .25/d3.event.transform.k);
    svg.selectAll('#empty_load').attr('transform',d3.event.transform).attr('font-size', 8/d3.event.transform.k).style('stroke-width', .25/d3.event.transform.k);

    //console.log(d3.event.transform.k)
    //console.log(d3.event.transform.k * 10)
    
    //svg.selectAll('line').attr('transform',d3.event.transform);
}