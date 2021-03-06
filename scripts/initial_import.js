var http = require('http');
var XLSX = require('xlsx');
var fs = require('fs');

// brugernavn, password og hostname bliver overskrevet,
// hvis der er en fil der hedder config.json (den holdes ude af git. Brug config-template.json som template)
var username = 'xxx'; //skriv eget
var password = 'xxx'; //skriv eget
var hostname = '127.0.0.1';
var dbname = 'metadata_data';


var inputfile = 'Metadata_dec_2014_eksponent.xlsx';
var schemaId = '848dc353c63f0054ce285e5e0b0537da';
var createSchema = false;

if (fs.existsSync('config.json')) {
    var cfg = JSON.parse(fs.readFileSync('config.json', {
        encoding: 'UTF-8'
    }));
    username = cfg.username;
    password = cfg.password;
    hostname = cfg.hostname;
    dbname = cfg.dbname;
}


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
                        if (doc){
                            if(!doc.properties.titel){
                                doc.properties.titel=doc.properties.datasætnavn;
                            }
                            docs.push(doc);
                        }
                        lastRow = row;
                        doc = {
                            "type": "data",
                            "imported": true,
                            "schema": createSchema ? uuid : schemaId,
                            "properties": {},
                            "data":{}
                        };

                    }
                    var propertyValue = xlsx.Sheets[sheet1][cell].v;

                    if (kolonner[col] === 'forvaltning' || kolonner[col]==='opdateringsfrekvens') {
                        propertyValue = propertyValue.toLowerCase();
                    }


                    if (kolonner[col] === 'serviceområde') {
                        switch(propertyValue.trim()){
                            case 'Byens Udvikling':
                                propertyValue='bu';
                                break;
                            case 'Byens Fysik':
                                propertyValue='bf';
                                break;
                            case 'Byens Drift':
                                propertyValue='bd';
                                break;
                            case 'Byens Anvendelse':
                                propertyValue='ba';
                                break;
                        }
                    }


                    // håndter udstilling
                    if(kolonner[col]==='Udstilling KBHkort' && propertyValue==='Ja'){
                        doc.properties.data = doc.properties.data||{};   
                        doc.properties.data['Eksternt på Københavnerkortet']=true;
                        continue;
                    }
                    if(kolonner[col]==='Udstilling kkkort' && propertyValue==='Ja'){
                        doc.properties.data = doc.properties.data||{};
                        doc.properties.data['Internt på KKkort']=true;
                        continue;
                    }
                    if(kolonner[col]==='Udstilling Data.kk' && propertyValue==='Ja'){
                        doc.properties.data = doc.properties.data||{};
                        doc.properties.data['Eksternt på data.kk.dk']=true;
                        continue;
                    }
                    



                    doc.properties[kolonner[col]] = propertyValue;
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
                path: '/' + dbname + '/' + uuid,
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

        } else {
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
                path: '/' + dbname + '/_bulk_docs',
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