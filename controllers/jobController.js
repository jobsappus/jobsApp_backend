const {
	GetCommand,
	PutCommand,
	DeleteCommand,
	UpdateCommand,
	ScanCommand
} = require('@aws-sdk/lib-dynamodb')
const ddbDocClient = require('../database/dynamo')
const TABLE_NAME = 'Job'

const getAllJobs = async (req, res, next) => {
	const params = {
		TableName: TABLE_NAME
	}
	const { Items } = await ddbDocClient.send(new ScanCommand(params))
	const ret = Items.map(async item => {
		const params = {
			TableName: 'Company',
			Key: {
				companyId: item.companyId + ''
			},
			scanFilter: {
				Limit: 1
			}
		}
		const I = await ddbDocClient.send(new GetCommand(params))

		const retu = { ...item, company: I.Item }
		// console.log(retu);
		return retu
	})
	Promise.all(ret).then(values => {
		res.status(200).json({ ok: true, data: values })
	})
	//use "for async "
}

const getJob = async (req, res, next) => {
	try {
		const { jobId } = req.params
		const params = {
			TableName: TABLE_NAME,
			Key: {
				jobId
			}
		}
		const { Item } = await ddbDocClient.send(new GetCommand(params))
		res.status(200).json({ ok: true, data: Item })
	} catch (err) {
		console.log(err)
		res.status(200).json({ ok: false, message: err.message })
	}
}

const createJob = async (req, res, next) => {
	const {
		companyId,
		jobTitle,
		jobLink,
		jobPostedDate,
		jobType,
		jobDesc,
		jobDomain
	} = req.body
	const date = Date.now() + ''
	// console.log(req.body)

	try {
		const dynamoCommand = new PutCommand({
			TableName: TABLE_NAME,
			Item: {
				jobId: date,
				companyId,
				jobTitle,
				jobLink,
				jobPostedDate,
				jobType,
				jobDesc,
				jobDomain
			}
		})
		const dynamoResponse = await ddbDocClient.send(dynamoCommand)
		res.status(201).json({ ok: true })
	} catch (err) {
		res.status(404).json({ ok: false, message: err.message })
	}
}

const updateJob = async (req, res, next) => {
	const jobId = req.params.jobId.split(',')[0]
	const { companyId, jobTitle, jobLink, jobPostedDate, jobType, jobDesc } =
		req.body
	try {
		const updateCommand = new UpdateCommand({
			TableName: TABLE_NAME,
			Key: { jobId },
			UpdateExpression:
				'SET #company = :companyValue, #title = :titleValue, #link = :linkValue, #date = :dateValue, #type = :typeValue, #desc = :descValue',
			ExpressionAttributeNames: {
				'#company': 'companyId',
				'#title': 'jobTitle',
				'#link': 'jobLink',
				'#date': 'jobPostedDate',
				'#type': 'jobType',
				'#desc': 'jobDesc'
			},
			ExpressionAttributeValues: {
				':companyValue': companyId,
				':titleValue': jobTitle,
				':linkValue': jobLink,
				':dateValue': jobPostedDate,
				':typeValue': jobType,
				':descValue': jobDesc
			}
		})
		const updated = await ddbDocClient.send(updateCommand)
		res.status(200).json({ ok: true, data: updated })
	} catch (err) {
		res.status(404).json({ ok: false, message: err.message })
	}
}

const deleteJob = async (req, res, next) => {
	const jobId = req.params.jobId.split('_')[0]
	// console.log(jobId)
	try {
		const deleteCommand = new DeleteCommand({
			TableName: TABLE_NAME,
			Key: { jobId }
		})
		await ddbDocClient.send(deleteCommand)
		res.status(200).json({ ok: true, message: 'Job deleted successfully' })
	} catch (err) {
		console.log(err)
		res.status(404).json({ ok: false, message: err.message })
	}
}

module.exports = { getAllJobs, createJob, getJob, updateJob, deleteJob }
