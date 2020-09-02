// @desc    Logs request to console
const logging = (req, res, next) => {
    console.log(
        `${req.method} ${req.protocol}://${req.host}${req.originalUrl}`
    );
    next();
};

module.exports = logging;
