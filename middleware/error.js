const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.log(err.stack.red);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new ErrorResponse(
            `Resource not found with id of ${err.value}`,
            404
        );
    }
    // Mongoose duplicated field error
    if (err.code === 11000) {
        error = new ErrorResponse(`Duplicated field value entered`, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
