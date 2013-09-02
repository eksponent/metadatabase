var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var fs = require('fs');
var config = {
	userName : 'sa',
	password : 'rutv2327',
	server : 'localhost',
	options : {
		database : 'metadata',
		rowCollectionOnDone : true
	}
};

var connection = new Connection(config);

connection.on('connect', function (err) {
	debugger;
	// If no error, then good to go...
	executeStatement();
});

function executeStatement() {
	var data = new Array();
	request = new Request("SELECT * from dataliste", function (err, rowCount) {
			if (err) {
				console.log(err);
			} else {
				console.log(rowCount + ' rows');
				var docs = {
					"docs" : data
				};
				fs.writeFile("data.json", JSON.stringify(docs), function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log("JSON saved to ");
					}
				});
			}
		});

	request.on('row', function (columns) {
		var doc = {
			"type" : "data",
			"schema" : "d3c82639f36be254876b50db90015817",
			"properties" : {}
		};
		columns.forEach(function (column) {
			doc.properties[column.metadata.colName] = column.value;
		});
		data.push(doc)
	});
	request.on('columnMetadata', function (columns) {
		var data = {};
		columns.forEach(function (column) {
			console.log(column.type.name);
			switch (column.type.name) {
			case "NVarChar":
				data[column.colName] = {
					"type" : "text"
				};
				break;
			case "Int":
				data[column.colName] = {
					"type" : "number"
				};
				break;
			case "BitN":
				data[column.colName] = {
					"options" : [{
							"value" : "true",
							"label" : "Yes"
						}, {
							"value" : "false",
							"label" : "No"
						}
					],
					"default" : "false",
					"type" : "radio"
				};
				break;
			case "DateTime":
				data[column.colName] = {
					"type" : "datetime"
				};
				break;
			}

		});
		var schema = {
			name : "Skema",
			type : "schema",
			properties : data
		};
		fs.writeFile('schema.json', JSON.stringify(schema), function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("We've received the metadata");
			}
		});
	});
	connection.execSql(request);
}
console.log("Start");
