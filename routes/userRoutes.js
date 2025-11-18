const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkRole } = require('../middleware/roleMiddleware');

router.get(
    '/users', 
    checkRole(['Admin']), 
    userController.listUsers
);

module.exports = router;
