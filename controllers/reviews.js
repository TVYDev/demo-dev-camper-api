const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    let jsonResults;

    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        jsonResults = {
            success: true,
            count: reviews.length,
            data: reviews
        };
    } else {
        jsonResults = res.advancedResults;
    }

    res.status(200).json(jsonResults);
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)
        .populate({
            path: 'bootcamp',
            select: 'name description'
        })
        .populate({
            path: 'user',
            select: 'name'
        });

    if (!review) {
        return next(
            new ErrorResponse(
                `Not found review with an id of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    Add review of a bootcamp
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    const bootcampId = req.params.bootcampId;
    req.body.bootcamp = bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Not found bootcamp with id of ${bootcampId}`,
                404
            )
        );
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(
                `Not found review with an id of ${req.params.id}`,
                404
            )
        );
    }

    // Make current user is the owner of the review, or the admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to access this route`, 403)
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(
                `Not found review with an id of ${req.params.id}`,
                404
            )
        );
    }

    // Make current user is the owner of the review, or the admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to access this route`, 403)
        );
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});
