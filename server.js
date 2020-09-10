const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
require('colors');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

// Body parser
app.use(express.json());

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
