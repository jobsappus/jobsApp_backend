const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
	'/google/callback',
	passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/poi',
	})
);

// router.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect to dashboard or home page
//     res.redirect('/');
//   });

module.exports = router;
