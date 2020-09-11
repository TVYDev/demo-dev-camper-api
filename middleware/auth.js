const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Case for getting token from cookie
    // else if (req.cookie.token) {
    //     token = req.cookie.token;
    // }

    // Make sure token does exist
    const unauthoriezedError = new ErrorResponse(
        'Not authorized to access this route',
        401
    );

    if (!token) {
        return next(unauthoriezedError);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        next(unauthoriezedError);
    }
});

exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(
            new ErrorResponse(
                `User with role ${req.user.role} is not authorized to access this route`,
                403
            )
        );
    }

    next();
};
