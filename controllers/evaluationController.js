// controllers/evaluationController.js
const evaluationService = require('../services/evaluationService');

const createEvaluation = async (req, res) => {
    try {
        const evaluatorId = req.user.id;
        const { evaluated_id, rating, comment } = req.body;
        
        const result = await evaluationService.createEvaluation(evaluatorId, evaluated_id, rating, comment);
        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao registrar avaliação:', error.message);
        if (error.message.includes('obrigatórios')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('Avaliação negada')) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes('Você já avaliou')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getMyEvaluations = async (req, res) => {
    try {
        const evaluatedId = req.user.id;
        const evaluations = await evaluationService.getMyEvaluations(evaluatedId);
        res.json(evaluations);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    createEvaluation,
    getMyEvaluations
};