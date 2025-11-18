const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { checkRole } = require('../middleware/roleMiddleware');


router.post(
    '/evaluations', 
    checkRole(['Contratante', 'Profissional']), 
    evaluationController.createEvaluation
);


router.get(
    '/my-evaluations', 
    evaluationController.getMyEvaluations 
);

module.exports = router;
