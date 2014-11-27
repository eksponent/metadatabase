var XLSX = require('xlsx');
var rp = require('request-promise');
var _ = require('underscore');

var username = 'xxx'; //skriv eget
var password = 'xxx'; //skriv eget
var hostname = '127.0.0.1';
var outputFileName = 'Exported.xlsx';


var dataUrl = 'http://'+hostname+':5984/metadata_data/_design/app/_view/data?include_docs=true'


function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}

function createRows(docs) {
    // pick all propertykeys as columns
    var keys = [];
    docs.forEach(function(doc) {
        for (var key in doc.properties) {
                keys.push(key);
        }
    });

    var columns = keys.filter(uniqueFilter);
    console.log(columns);

    var rows = [];
    docs.forEach(function(doc) {
        var row = [];
        columns.forEach(function(col) {
            if (col === 'data') {
                row.push(JSON.stringify(doc.properties[col]));
            } else {
                row.push(doc.properties[col])
            }
        });

        row = row.concat(doc._id,doc._rev, doc.type, doc.schema,doc.timestamp);

        rows.push(row);
    });
    columns = columns.concat(['doc._id','doc._rev', 'doc.type', 'doc.schema','doc.timestamp']);
    rows.unshift(columns);
    console.log('Data to spreadsheet');
    // console.log(rows);
    return rows;
}

function handleData(data) {
    data = JSON.parse(data)
    console.log('Found rows: ' + data.rows.length);

    var docs = data.rows.map(function(e, i) {
        return e.doc;
    });

    var rowdata = createRows(docs);
    createxlsx(rowdata);
}

// WORKBOOK STUFF
function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = {
        s: {
            c: 10000000,
            r: 10000000
        },
        e: {
            c: 0,
            r: 0
        }
    };
    for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            var cell = {
                v: data[R][C]
            };
            if (cell.v == null) continue;
            var cell_ref = XLSX.utils.encode_cell({
                c: C,
                r: R
            });

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function createxlsx(data) {
    var ws_name = "Ark1";
    var wb = new Workbook();
    var ws = sheet_from_array_of_arrays(data);	
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    XLSX.writeFile(wb, outputFileName);
}

// END WORKBOOK STUFF


rp.get(dataUrl)
    .then(handleData)
    .catch(function(err) {
        console.log('ERROR');
        console.log(err);
    });