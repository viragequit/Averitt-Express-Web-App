/* 
    Value: citiesData
    Purpose: Stores the data of cities and to be able to move to the map file.
*/
var citesData = null;

/* 
    Value: linesData
    Purpose: Stores the data of lines and to be able to move to the map file.
*/
var linesData = null;

var line_file_name = null;

/*
    Function: handleFilesCites
    Paramaters: files
    Return: None
    Description:
 */
function handleFiles(files, type) {
	// Check for the various File API support.
	file_name = files[0]['name'];
	ext = file_name.substring(file_name.lastIndexOf('.')+1)
	if(ext == 'csv')
	{
		if (window.FileReader) {
			// FileReader are supported.
			getAsText(files[0], type);
		} else {
			alert('FileReader are not supported in this browser.');
		}
	}
	else
	{
		alert("File that was provided is not a CSV File.");
	}
}

/*
    Function: getAsTextCites
    Paramaters: filesToRead
    Return: None
    Description:
 */
function getAsText(fileToRead, type) {
	var reader = new FileReader();
	
	if(type == "Cities")
	{
		reader.onload = loadHandlerCites;
	}
	else if(type == "Lines")
	{
		reader.onload = loadHandlerLines;
		window.line_file_name = fileToRead.name;
	}
	else
	{
		alert("Injection")
	}

	reader.onerror = errorHandler;
	// Read file into memory as UTF-8      
	reader.readAsText(fileToRead);
}

/*
    Function: loadHandlerCites
    Paramaters: event
    Return: None
    Description:
 */
function loadHandlerCites(event) {
	var csv = event.target.result;
	//console.log(csv);
	window.citesData = processDataAsObj(csv);     
}

/*
    Function: loadHandlerLines
    Paramaters: event
    Return: None
    Description:
 */
function loadHandlerLines(event) {
	var csv = event.target.result;
	//console.log(csv);
	window.linesData = processDataAsObj(csv);     
}

/*
    Function: processDataAsObj
    Paramaters: csv
    Return: None
    Description:
 */
//if your csv file contains the column names as the first line
function processDataAsObj(csv){
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
	
    //first line of csv
    var keys = allTextLines.shift().split(',');
	
    while (allTextLines.length) {
        var arr = allTextLines.shift().split(',');
        var obj = {};
        for(var i = 0; i < keys.length; i++){
            obj[keys[i]] = arr[i];
	}
        lines.push(obj);
    }
	
	//console.log(lines);
	return lines;
}

/*
    Function: errorHandler
    Paramaters: evt
    Return: None
    Description:
 */
function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Canno't read file !");
	}
}

/*
    Function: drawOutputAsObj
    Paramaters: lines
    Return: None
    Description:Bug testing
 */
//draw the table, if first line contains heading
function drawOutputAsObj(lines){
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("table");
	
	//for the table headings
	var tableHeader = table.insertRow(-1);
 	Object.keys(lines[0]).forEach(function(key){
 		var el = document.createElement("TH");
		el.innerHTML = key;		
		tableHeader.appendChild(el);
	});	
	
	//the data
	for (var i = 0; i < lines.length; i++) {
		var row = table.insertRow(-1);
		Object.keys(lines[0]).forEach(function(key){
			var data = row.insertCell(-1);
			data.appendChild(document.createTextNode(lines[i][key]));
		});
	}
	document.getElementById("output").appendChild(table);
}

/*
    Function: getCities
    Paramaters: None
    Return: city
    Description: 
 */
function getCities()
{
	city = window.citesData

	if(city)
	{
		while(city[city.length - 1]['SVC'] == '')
		{
			city = city.slice(0, (city.length -1));
		}
	}
	return city;
}

/*
    Function: getLines
    Paramaters: None
    Return: linesData
    Description: 
 */
function getLines()
{
	linesData = window.linesData
	if(linesData)
	{
		while(linesData[linesData.length - 1]['From'] == '')
		{
			linesData = linesData.slice(0, (linesData.length -1))
		}
	}
	return linesData;
}

function getLineFileName()
{
	return window.line_file_name;
}

function emptyData()
{
	window.linesData = null;
	window.citesData = null;
	window.line_file_name = null;
	document.getElementById("csvFileInput0").value = null;
	document.getElementById("csvFileInput1").value = null;
}