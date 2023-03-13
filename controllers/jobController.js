const {
	GetCommand,
	PutCommand,
	ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const ddbDocClient = require('../database/dynamo');
const TABLE_NAME = 'Jobs';

const getAllJobs = async (req, res, next) => {
	const params = {
		TableName: TABLE_NAME,
	};
	const { Items } = await ddbDocClient.send(new ScanCommand(params));
	const ret = Items.map(async item => {
		const params = {
			TableName: 'Companies',
			Key: {
				companyId: item.companyId + '',
			},
			scanFilter: {
				Limit: 1,
			},
		};
		const I = await ddbDocClient.send(new GetCommand(params));

		const retu = { ...item, company: I.Item };
		// console.log(retu);
		return retu;
	});
	Promise.all(ret).then(values => {
		res.status(200).json({ ok: true, data: values });
	});
	//use "for async "
};

const getJob = async (req, res, next) => {};

const createJob = async (req, res, next) => {
	const { companyId, jobTitle, jobLink, jobPostedDate, jobType, jobDesc } =
		req.body; // jobType is a boolean
	const date = Date.now() + '';
	// console.log(companyId, jobTitle, jobLink, jobPostedDate, jobType, jobDesc);
	// res.send({ ok: true });
	// return;
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
			},
		});
		const dynamoResponse = await ddbDocClient.send(dynamoCommand);
		// console.log(dynamoResponse);
		res.status(201).json({ ok: true });
	} catch (err) {
		res.status(404).json({ ok: false, message: err.message });
	}
};

const updateJob = async (req, res, next) => {};

const deleteJob = async (req, res, next) => {};

module.exports = { getAllJobs, createJob, getJob, updateJob, deleteJob };
