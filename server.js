require('dotenv').config();

process.on('uncaughtException', err => {
	console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
	console.log('UNHANDLED REJECTION! 💥 Shutting down...');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

process.on('SIGTERM', () => {
	console.log('SIGTERM RECIEVED, SHUTTING DOWN');
	server.close(() => {
		console.log('process terminated');
	});
});
