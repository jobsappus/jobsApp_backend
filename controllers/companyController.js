const sharp = require('sharp');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
	region: 'us-east-2',
	credentials: {
		accessKeyId: process.env.aws_access_key_id,
		secretAccessKey: process.env.aws_secret_access_key,
	},
});

const {
	GetCommand,
	PutCommand,
	ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const ddbDocClient = require('../database/dynamo');
const TABLE_NAME = 'Companies';

async function getAllCompanies(req, res, next) {
	const params = {
		TableName: TABLE_NAME,
	};
	const Companies = await ddbDocClient.send(new ScanCommand(params));
	res.status(200).json({ ok: true, data: Companies.Items });
}

async function getCompany(req, res, next) {}

async function createCompany(req, res, next) {
	try {
		const compressedImage = await sharp(req.file.buffer)
			.resize({ width: 500, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 70 })
			.toBuffer();

		// upload to S3
		const date = Date.now();
		const fileKey = `${req.file.originalname.split('.')[0]}_${date}`;
		const putObjectCommand = new PutObjectCommand({
			Bucket: 'new-project-logo-storage',
			Key: fileKey,
			Body: compressedImage,
			ContentType: 'image/jpeg',
		});
		await s3.send(putObjectCommand);

		// save to dynamo
		const imageUrl = `https://new-project-logo-storage.s3.amazonaws.com/${fileKey}`;
		const dynamoCommand = new PutCommand({
			TableName: TABLE_NAME,
			Item: {
				companyId: date + '',
				name: req.body.name,
				h1b: req.body.h1b,
				logo: imageUrl,
			},
		});
		const dynamoResponse = await ddbDocClient.send(dynamoCommand);

		// send response
		res.status(201).json({ ok: true });
	} catch (err) {
		res.status(404).json({ ok: false, message: err.message });
	}
}

module.exports = { getAllCompanies, createCompany };
