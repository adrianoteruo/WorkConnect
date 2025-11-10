// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkRole } = require('../middleware/roleMiddleware');

// GET /api/users (Rota exclusiva do Admin)
router.get(
    '/users', 
    checkRole(['Admin']), 
    userController.listUsers
);

module.exports = router;