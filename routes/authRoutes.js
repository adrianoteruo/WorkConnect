// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rotas Públicas 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas Protegidas 
router.use(verifyToken);

router.get('/users/:id', authController.getProfile);
router.put('/users/:id', authController.updateProfile);
router.delete('/users/:id', authController.deleteProfile);


module.exports = router;