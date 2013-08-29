function (newDoc, oldDoc, userCtx) {
	if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('metadata') !== -1) {
		return;
	} else {
		throw({
			forbidden : 'Du skal være logget ind for at kunne gemme.'
		});
	}
}