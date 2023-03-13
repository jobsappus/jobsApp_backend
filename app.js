const express = require('express');
const cors = require('cors');
// Routes
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const companyRouter = require('./routes/companyRoutes');
const jobRouter = require('./routes/jobRoutes');

// Auth
const session = require('express-session');
const passport = require('passport');
require('./config/passport-google');

const app = express();

app.use(cors());

app.use(
	session({
		secret: 'keyboard cat',
		cookie: { maxAge: 60000 },
		resave: false,
		saveUninitialized: false,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// 2) ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/companies', companyRouter);

app.get('/', (req, res, next) => {
	console.log('req.user', req.user);
	res.status(200).json({
		status: 'success',
		message: 'Welcome to the API',
	});
});

module.exports = app;
