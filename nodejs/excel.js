var XLSX = require('xlsx');
var xlsx = XLSX.readFile('book1.xlsx');
var sheet_name_list = xlsx.SheetNames;
xlsx.SheetNames.forEach(function (y) {
	for (z in xlsx.Sheets[y]) {
		debugger;
		if (z[0] === '!')
			debugger;
		console.log(y + "!" + z + "=" + JSON.stringify(xlsx.Sheets[y][z].v));
	}
});
