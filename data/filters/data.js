function (doc, req) {
	if (doc._deleted || (doc.type && doc.type == 'data')) {
		return true;
	} else {
		return false;
	}
}