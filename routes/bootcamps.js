const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsWithinDistance
} = require('../controllers/bootcamps');

const router = express.Router();

router
    .route('/within-distance/:zipcode/:distance/:unit')
    .get(getBootcampsWithinDistance);

router.route('/').get(getBootcamps).post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;
