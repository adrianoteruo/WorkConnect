// routes/professionalRoutes.js
const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const { checkRole } = require('../middleware/roleMiddleware');

// GET /api/professionals
router.get(
    '/professionals', 
    checkRole(['Contratante', 'Admin']), 
    professionalController.getProfessionals
);

// GET /api/professional-stats
router.get(
    '/professional-stats',
    checkRole(['Profissional']),
    professionalController.getProfessionalStats 
);

module.exports = router;