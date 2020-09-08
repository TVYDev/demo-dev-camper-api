const express = require('express');
const { getCourses } = require('../controllers/courses');

// Reference for nested routes: https://stackoverflow.com/a/25305272/11934312
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses);

module.exports = router;
