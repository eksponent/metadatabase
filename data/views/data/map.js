function (doc) {
	if (doc.type && doc.type == "data")
		emit([doc.titel, doc.beskrivelse], null);
}