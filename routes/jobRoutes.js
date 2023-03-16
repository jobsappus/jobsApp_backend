const jobController = require('../controllers/jobController')
const isAdmin = require('../controllers/authController')

const express = require('express')
const router = express.Router()

router
	.route('/')
	.get(jobController.getAllJobs)
	.post(isAdmin, jobController.createJob)

router
	.route('/:jobId')
	.get(jobController.getJob)
	.put(isAdmin, jobController.updateJob)
	.delete((req, res, next) => {
		const [jobId, token] = req.params.jobId.split('_')
		if (token && token === process.env.JWT_SECRET) {
			next()
		} else {
			res.json({
				ok: false,
				message: 'Unauthorized'
			})
			return
		}
	}, jobController.deleteJob)

module.exports = router
