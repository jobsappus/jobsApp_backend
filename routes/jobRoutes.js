const jobController = require('../controllers/jobController');
const isAdmin = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router
	.route('/')
	.get(jobController.getAllJobs)
	.post(isAdmin, jobController.createJob)
	.patch(isAdmin, jobController.updateJob)
	.delete(isAdmin, jobController.deleteJob);

module.exports = router;
