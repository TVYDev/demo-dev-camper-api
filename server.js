const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load route files
const bootcamps = require('./routes/bootcamps');

const app = express();

// Body parser
app.use(express.json());

// Connect to database
connectDB();

// Dev logging middleware
app.use(morgan('tiny'));

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);

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
