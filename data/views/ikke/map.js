function (doc) {
	if (doc.schema && doc.schema !== "c6175944060aa68f9c23bee0af002426")
		emit(doc.name, doc);
}