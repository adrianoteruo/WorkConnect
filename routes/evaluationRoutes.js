// routes/evaluationRoutes.js
const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { checkRole } = require('../middleware/roleMiddleware');

// POST /api/evaluations
router.post(
    '/evaluations', 
    checkRole(['Contratante', 'Profissional']), 
    evaluationController.createEvaluation
);

// GET /api/my-evaluations
router.get(
    '/my-evaluations', 
    evaluationController.getMyEvaluations 
);

module.exports = router;