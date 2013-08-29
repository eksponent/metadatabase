function (newDoc, oldDoc, userCtx) {
	log(userCtx.roles);
	if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('metadata') !== -1) {
		return;
	} else {
		throw({
			forbidden : 'Only admins may edit the database'
		});
	}
}