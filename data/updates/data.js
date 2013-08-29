function (doc, req) {
	var ny = JSON.parse(req.body);
	if (req.id) {
		ny._id = req.id;
	} else {
		ny._id = req.uuid;
	}
	ny.timestamp = new Date().toJSON();
	ny.type = "data";
	return [ny, ny._id];
}