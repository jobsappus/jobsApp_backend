// require('dotenv').config();
// const { DynamoDB, GetItemCommand } = require('@aws-sdk/client-dynamodb');

// // Set up AWS DynamoDB
// const dynamodb = new DynamoDB({ region: 'us-east-2' });

// dynamodb.listTables({}, (err, data) => {
// 	if (err) {
// 		console.log('Error', err);
// 	} else {
// 		console.log('Table names are ', data.TableNames);
// 	}
// });

// // Set the parameters
// const params = {
// 	TableName: 'users', //TABLE_NAME
// 	Key: {
// 		id: { S: '115537730773451097235' },
// 		// id: { S: '108155090095807839029' },
// 	},
// };

// const run = async () => {
// 	const data = await dynamodb.send(new GetItemCommand(params));
// 	console.log('Success', data.Item);
// 	return data;
// };

// run();

// module.exports = dynamodb;

// const ex = {
// 	id: '115537730773451097235',
// 	displayName: 'jobs app',
// 	name: { familyName: 'app', givenName: 'jobs' },
// 	emails: [{ value: 'jobsappus@gmail.com', verified: true }],
// 	photos: [
// 		{
// 			value: 'https://lh3.googleusercontent.com/a/AGNmyxZHg0DkhSFuJvMvItfvzYJciAlT9v20ufidTPq9=s96-c',
// 		},
// 	],
// 	provider: 'google',
// 	_json: {
// 		sub: '115537730773451097235',
// 		name: 'jobs app',
// 		given_name: 'jobs',
// 		family_name: 'app',
// 		picture:
// 			'https://lh3.googleusercontent.com/a/AGNmyxZHg0DkhSFuJvMvItfvzYJciAlT9v20ufidTPq9=s96-c',
// 		email: 'jobsappus@gmail.com',
// 		email_verified: true,
// 		locale: 'en-GB',
// 	},
// };

// Create service client module using ES6 syntax.
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
// Set the AWS Region.
const REGION = 'us-east-2';
// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({
	region: REGION,
	credentials: {
		accessKeyId: process.env.aws_access_key_id,
		secretAccessKey: process.env.aws_secret_access_key,
	},
});

const marshallOptions = {
	convertEmptyValues: true, // false, by default.
	// Whether to remove undefined values while marshalling.
	removeUndefinedValues: false, // false, by default.
	// Whether to convert typeof object to map attribute.
	convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
	// Whether to return numbers as a string instead of converting them to native JavaScript numbers.
	wrapNumbers: true,
};

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB Document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);

module.exports = ddbDocClient;
