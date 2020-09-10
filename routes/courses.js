const express = require('express');
const { getCourses, getCourse, addCourse } = require('../controllers/courses');

// Reference for nested routes: https://stackoverflow.com/a/25305272/11934312
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse);

module.exports = router;
