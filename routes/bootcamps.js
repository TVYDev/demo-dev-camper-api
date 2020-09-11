const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsWithinDistance,
    uploadBootcampPhoto
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Include other resourse routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route to other resourse routers
router.use('/:bootcampId/courses', courseRouter);

router
    .route('/within-distance/:zipcode/:distance/:unit')
    .get(getBootcampsWithinDistance);

router
    .route('/')
    .get(
        advancedResults(Bootcamp, {
            path: 'courses',
            select: 'title description'
        }),
        getBootcamps
    )
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), uploadBootcampPhoto);

module.exports = router;
