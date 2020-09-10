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

// Include other resourse routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route to other resourse routers
router.use('/:bootcampId/courses', courseRouter);

router
    .route('/within-distance/:zipcode/:distance/:unit')
    .get(getBootcampsWithinDistance);

router.route('/').get(getBootcamps).post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

router.route('/:id/photo').put(uploadBootcampPhoto);

module.exports = router;
