const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getDepartments)
    .post(protect, admin, createDepartment);

router.route('/:id')
    .put(protect, admin, updateDepartment)
    .delete(protect, admin, deleteDepartment);

module.exports = router;
