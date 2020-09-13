const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
require('colors');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Prevent NoSQL injection, MongoDB operator injection
app.use(mongoSanitize());

// Cookie parser
app.use(cookieParser());

// Add security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limit
app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 100,
        message:
            'You have made too many requests in a period. Please wait and try again later'
    })
);

// Prevent HTTP Parameter Polluction Attacks
app.use(hpp());

// Enable CORS
app.use(cors());

// Connect to database
connectDB();

// Dev logging middleware
app.use(morgan('tiny'));

// Allow fileupload middleware
app.use(fileUpload());

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Add error handler
app.use(errorHandler);

// Set 'public' directory as static for public access
console.log(path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
            .yellow.bold
    )
);

// Gloabl handle of unhandle promise rejection
process.on('unhandledRejection', (error) => {
    console.log(`Error: ${error.message}`.red);

    // Close the server and exit process with failure
    server.close(() => process.exit(1));
});
