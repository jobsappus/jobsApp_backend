const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
	// console.log(req.body);
	const { loginId, password } = req.body;
	if (loginId !== '115537730773451097235' || password !== '12345678') {
		res.status(401).json({ ok: false, message: 'Invalid credentials' });
		return;
	}
	res.status(200).json({ ok: true, token: process.env.JWT_SECRET });
});

module.exports = router;
