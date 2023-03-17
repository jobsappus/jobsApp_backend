const sharp = require('sharp');

const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const s3 = new S3Client({
	region: 'us-east-2',
	credentials: {
		accessKeyId: process.env.aws_access_key_id,
		secretAccessKey: process.env.aws_secret_access_key,
	},
});
const BUCKET_NAME = 'company-logo.bucket';

const {
	GetCommand,
	PutCommand,
	UpdateCommand,
	ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const ddbDocClient = require('../database/dynamo');
const TABLE_NAME = 'Company';

async function getAllCompanies(req, res, next) {
	const params = {
		TableName: TABLE_NAME,
	};
	const Companies = await ddbDocClient.send(new ScanCommand(params));
	res.status(200).json({ ok: true, data: Companies.Items });
}

async function getCompany(req, res, next) {
	try {
		const { id } = req.params;
		const params = {
			TableName: TABLE_NAME,
			Key: {
				companyId: id,
			},
		};
		const { Item } = await ddbDocClient.send(new GetCommand(params));
		res.status(200).json({ ok: true, data: Item });
	} catch (err) {
		console.log(err);
		res.status(200).json({ ok: false, message: err.message });
	}
}

async function createCompany(req, res, next) {
	try {
		const compressedImage = await sharp(req.file.buffer)
			.resize({ width: 500, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 70 })
			.toBuffer();

		// upload to S3
		const date = Date.now();
		const fileKey = `${req.file.originalname.split('.')[0]}_${date}`;

		await uploadToS3(fileKey, compressedImage);
		// save to dynamo
		// const imageUrl = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${fileKey}`
		const imageUrl = `https://s3.us-east-2.amazonaws.com/${BUCKET_NAME}/${fileKey}`;
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

async function updateCompany(req, res, next) {
	try {
		const { id } = req.params;
		const { name, h1b, s3Name } = req.body;
		const key = { companyId: id };

		// return
		if (s3Name && s3Name !== 'images.jpg') {
			await deleteFromS3(s3Name);
		}

		const compressedImage = await sharp(req.file.buffer)
			.resize({ width: 500, fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 70 })
			.toBuffer();

		const date = Date.now();
		const fileKey = `${req.file.originalname.split('.')[0]}_${date}`;

		await uploadToS3(fileKey, compressedImage);
		// Define the update expression and attribute values for the item
		const logo = `https://s3.us-east-2.amazonaws.com/${BUCKET_NAME}/${fileKey}`;

		const updateExpression =
			'SET #name = :nameValue, #logo = :logoValue, #h1b = :h1bValue';
		const attributeValues = {
			':nameValue': name,
			':logoValue': logo,
			':h1bValue': h1b,
		};
		const attributeNames = {
			'#name': 'name',
			'#logo': 'logo',
			'#h1b': 'h1b',
		};

		const updateCommand = new UpdateCommand({
			TableName: TABLE_NAME,
			Key: key,
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: attributeValues,
			ExpressionAttributeNames: attributeNames,
		});

		// Execute the UpdateItemCommand
		const updated = await ddbDocClient.send(updateCommand);
		res.status(200).json({ ok: true, data: updated });
	} catch (err) {
		res.status(404).json({ ok: false, message: err.message });
	}
}

async function uploadToS3(fileKey, compressedImage) {
	const putObjectCommand = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: fileKey,
		Body: compressedImage,
		ContentType: 'image/jpeg',
	});
	await s3.send(putObjectCommand);
}

async function deleteFromS3(key) {
	const deleteCommand = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	// Execute the DeleteObjectCommand
	s3.send(deleteCommand)
		.then(response => {
			return true;
		})
		.catch(error => {
			console.error(error);
			return false;
		});
}

module.exports = { getCompany, getAllCompanies, createCompany, updateCompany };
