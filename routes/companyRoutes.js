const companyController = require('../controllers/companyController')
const isAdmin = require('../controllers/authController')

const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router
	.route('/')
	.get(companyController.getAllCompanies)
	.post(upload.single('image'), isAdmin, companyController.createCompany)

router
	.route('/:id')
	.get(companyController.getCompany)
	.put(upload.single('image'), isAdmin, companyController.updateCompany)

module.exports = router
