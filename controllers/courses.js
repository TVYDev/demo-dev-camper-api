const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses & courses by bootcamps
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find();
    }

    // populate bootcamp data
    query = query.populate({
        path: 'bootcamp',
        select: 'name description'
    });

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(
            new ErrorResponse(`Not found course with Id of ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add a course to a bootcamp
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    const bootcampId = req.params.bootcampId;
    req.body.bootcamp = bootcampId;

    const bootcamp = await Bootcamp.findById(bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Not found bootcamp with id of ${bootcampId}`)
        );
    }

    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    });
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(
            new ErrorResponse(`Not found course with id of ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Detelet a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndRemove(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`Not found course with id of ${req.params.id}`)
        );
    }

    res.status(200).json({ success: true, data: {} });
});
