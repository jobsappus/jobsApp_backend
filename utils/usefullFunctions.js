const jwt = require('jsonwebtoken');

module.exports.generateToken = user => {
	const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
		expiresIn: '12h',
	});
	return token;
};
