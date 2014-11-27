var XLSX = require('xlsx');
var http = require('http');
var rp = require('request-promise');
var _ = require('underscore');
var fs = require('fs');
var username = 'xxx'; //skriv eget
var password = 'xxx'; //skriv eget
var hostname = '127.0.0.1'; 
var inputFileName = 'Exported.xlsx';


var xlsx = XLSX.readFile(inputFileName);
var docs = new Array();
var kolonner = {};
var row;
var sheet1 = xlsx.SheetNames[0]; //læs første sheet

var lastRow;
var doc;
for (var cell in xlsx.Sheets[sheet1]) {
    if (cell[0] === '!') continue
    var row = cell.match(/\d+/g);
    var col = cell.match(/[a-zA-Z]+/g);
    if (row == 1) //Kolonne overskrifter
    {
        kolonner[col] = xlsx.Sheets[sheet1][cell].v;
    } else {
        try {
            if (!lastRow || (lastRow && lastRow[0] != row[0])) {
                if (doc)
                    docs.push(doc);
                lastRow = row;
                doc = {
                    "properties": {}
                };

            }
var cellVal=xlsx.Sheets[sheet1][cell].v;
            var docField = kolonner[col].match(/^doc\.(\w{1,20})/);
            if (docField) {
            	doc[docField[1]]=cellVal;
            } else {
            	if(kolonner[col]==='data'){
            		cellVal=JSON.parse(cellVal);
            	}

                doc.properties[kolonner[col]] = cellVal;

            }
        } catch (err) {
            console.log(err.message);
        }
    }
}



fs.writeFile("data.json", JSON.stringify(docs), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("JSON saved to data.json");
    }
});

saveDocs(docs);


function saveDocs(docs) {
            var optionsDocs = {
                hostname: hostname,
                port: 5984,
                path: '/metadata_data/_bulk_docs',
                method: 'POST',
                auth: username + ':' + password,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            var reqDocs = http.request(optionsDocs, function(resDocs) {
                var dataDocs = '';
                resDocs.on('data', function(chunk) {
                    dataDocs += chunk;
                });
                resDocs.on('error', function(e) {
                    console.log('POST DOCS ERROR: ' + e.message);
                });
                resDocs.on('end', function() {
                    console.log(dataDocs);
                });
            });
            debugger;
            reqDocs.write(JSON.stringify({
                'docs': docs
            }));
            reqDocs.end();
        }


