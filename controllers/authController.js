const isAdmin = (req, res, next) => {
	if (req.body.token && req.body.token === process.env.JWT_SECRET) {
		next();
	} else {
		res.json({
			ok: false,
			message: 'Unauthorized',
		});
		return;
	}
};

module.exports = isAdmin;
