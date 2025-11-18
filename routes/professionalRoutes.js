const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const { checkRole } = require('../middleware/roleMiddleware');

router.get(
    '/professionals', 
    checkRole(['Contratante', 'Admin']), 
    professionalController.getProfessionals
);


router.get(
    '/professional-stats',
    checkRole(['Profissional']),
    professionalController.getProfessionalStats 
);

module.exports = router;
