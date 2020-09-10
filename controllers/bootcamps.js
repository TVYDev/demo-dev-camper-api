const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // Copy query params
    const reqQuery = { ...req.query };

    // Excluded fields
    const excludedFields = ['select', 'sort', 'limit', 'page'];
    excludedFields.forEach((param) => delete reqQuery[param]);

    // String of query params
    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
    );

    let query = Bootcamp.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const select = req.query.select.split(',').join(' ');
        query = query.select(select);
    }

    // Sort by
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        console.log(sortBy);
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const pagination = {};

    if (endIndex < totalCount) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    // Reverse populate
    query = query.populate({
        path: 'courses',
        select: 'title description'
    });

    const bootcamps = await query;

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps
    });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id).populate({
        path: 'courses',
        select: 'title description tuition'
    });

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Update single bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete single bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

    await bootcamp.remove();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a distance
// @route   GET /api/v1/bootcamps/within-distance/:zipcode/:distance/:unit
// @access  Public
exports.getBootcampsWithinDistance = asyncHandler(async (req, res, next) => {
    const { zipcode, distance, unit } = req.params;

    const loc = await geocoder.geocode({ zipcode });
    const { longitude: lng, latitude: lat } = loc[0];

    if (!['km', 'mi'].includes(unit)) {
        return next(
            new ErrorResponse(
                `Invalid unit of distance, available only in km or mi`,
                400
            )
        );
    }

    // Reference: http://www.1728.org/radians.htm
    // Syntax: To find central angle
    // arc length = radius * central angle(radians)
    // We have:
    // --- radius as earth radius: 3,963.2 miles or 6,378.1 kilometres
    // --- arc length as distance
    const radius = unit === 'km' ? 6378.1 : 3963.2;
    const radian = distance / radius;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radian]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Upload photo of a bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
    const bootcampId = req.params.id;
    let bootcamp = await Bootcamp.findById(bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Not found bootcamp with id of ${bootcampId}`,
                404
            )
        );
    }

    // Check if has a file uploaded
    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    // Check if uploaded file is image file
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check size of image file
    if (file.size > process.env.FILE_UPLOAD_MAX_BYTE_SIZE) {
        return next(
            new ErrorResponse(
                'Please upload a file not exceeding 1MB in size',
                400
            )
        );
    }

    // Create custom file name
    const fileName = `photo_${bootcampId}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${fileName}`, async (error) => {
        if (error) {
            console.log(error);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
    });

    bootcamp = await Bootcamp.findByIdAndUpdate(
        bootcampId,
        { photo: fileName },
        { new: true }
    );

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});
