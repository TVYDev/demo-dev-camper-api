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
    const excludedFields = ['select', 'sort'];
    excludedFields.forEach(param => delete reqQuery[param]);

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
    }
    else {
        query = query.sort('-createdAt');
    }

    const bootcamps = await query;

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

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
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }

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
