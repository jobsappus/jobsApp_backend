const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const ddbDocClient = require('../database/dynamo.js');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

function repeat(profile) {
	return {
		id: profile.id,
		name: profile.displayName,
		email: profile.emails[0].value,
		photo: profile?.photos[0]?.value,
		companiesApplied: [],
		jobsApplied: [],
		isAdmin: false,
	};
}

// passport.use(
// 	new GoogleStrategy(
// 		{
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 			callbackURL: '/api/v1/auth/google/callback',
// 			scope: ['email', 'profile'],
// 		},
// 		async function passportCallback(
// 			accessToken,
// 			refreshToken,
// 			profile,
// 			done
// 		) {
// 			try {
// 				const params = {
// 					TableName: 'users',
// 					Key: {
// 						id: { S: profile.id },
// 					},
// 				};
// 				const data = await dynamodb.send(new GetItemCommand(params));
// 				// console.log('data when getting', data);
// 				if (data.Item) {
// 					done(null, repeat(profile));
// 				} else {
// 					const params = {
// 						TableName: 'users',
// 						Item: {
// 							id: { S: profile.id },
// 							name: { S: profile.displayName },
// 							email: { S: profile.emails[0].value },
// 						},
// 					};
// 					const data = await dynamodb.send(new PutItemCommand(params));
// 					// console.log('data when putting', data);
// 					done(null, repeat(profile));
// 				}
// 			} catch (err) {
// 				console.log(err);
// 				done(err, null);
// 			}
// 		}
// 	)
// );
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/api/v1/auth/google/callback',
			scope: ['email', 'profile'],
		},
		async function passportCallback(
			accessToken,
			refreshToken,
			profile,
			done
		) {
			try {
				const params = {
					TableName: 'users',
					Key: {
						id: profile.id,
					},
				};
				const data = await ddbDocClient.send(new GetCommand(params));
				// console.log('data when getting', data);
				if (data.Item) {
					done(null, repeat(profile));
				} else {
					const params = {
						TableName: 'users',
						Item: repeat(profile),
					};
					// console.log(params);
					const data = await ddbDocClient.send(new PutCommand(params));
					// console.log('data when putting', data);
					done(null, repeat(profile));
				}
			} catch (err) {
				console.log(err);
				done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
