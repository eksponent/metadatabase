var http = require('http');
var XLSX = require('xlsx');
var fs = require('fs');

var username = 'xxx'; //skriv eget
var password = 'xxx'; //skriv eget
var hostname = '127.0.0.1'; 
var inputfile = 'Mappe1.xlsx';
var schemaId = '848dc353c63f0054ce285e5e0b0537da';
var createSchema = false;



debugger;
//Hent ny uuid fra server
http.get('http://' + hostname + ':5984/_uuids', function(res) {
    var data = '';
    res.on('data', function(chunk) {
        data += chunk;
    });
    res.on('end', function() {
        debugger;
        var obj = JSON.parse(data);
        var uuid = obj.uuids[0];
        console.log(uuid);
        // Læs Excel
        var xlsx = XLSX.readFile(inputfile);

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
                            "type": "data",
                            "imported":true,
                            "schema":  createSchema ? uuid : schemaId,
                            "properties": {}
                        };

                    }
                    doc.properties[kolonner[col]] = xlsx.Sheets[sheet1][cell].v;
                } catch (err) {
                    console.log(err.message);
                }
            }

        }

        if (createSchema) {
            var schemaProperties = {};
            Object.keys(kolonner).forEach(function(key) {
                schemaProperties[kolonner[key]] = {
                    "type": "text",
                    'label': kolonner[key]

                };
            });
            var schema = {
                name: "Skema",
                type: "schema",
                properties: schemaProperties
            };
            fs.writeFile('schema.json', JSON.stringify(schema), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("We've received the metadata");
                }
            });
            var options = {
                hostname: hostname,
                port: 5984,
                path: '/metadata_data/' + uuid,
                method: 'PUT',
                auth: username + ':' + password,
                headers: {
                    "Content-Type": "application/json"
                }
            };
            var reqSchema = http.request(options, function(resSchema) {
                var dataSchema = '';
                resSchema.on('data', function(chunk) {
                    dataSchema += chunk;
                });
                resSchema.on('error', function(e) {
                    console.log('fejl');
                    console.log('PUT SCHEMA ERROR: ' + e.message);
                });
                resSchema.on('end', function() {
                    console.log(dataSchema);
                    saveDocs();

                });
            });
            debugger;
            reqSchema.write(JSON.stringify(schema));
            reqSchema.end();

        }else{
        	saveDocs();
        }



        fs.writeFile("data.json", JSON.stringify(docs), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved to ");
            }
        });


        function saveDocs() {
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


        console.log(options);
    });
});