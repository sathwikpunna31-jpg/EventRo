const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    updateClub,
    deleteClub
} = require('../controllers/clubController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getClubs)
    .post(protect, admin, createClub);

router.route('/:id')
    .put(protect, admin, updateClub)
    .delete(protect, admin, deleteClub);

module.exports = router;
