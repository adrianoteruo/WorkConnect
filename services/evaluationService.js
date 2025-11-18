const evaluationRepository = require('../repositories/evaluationRepository');
const serviceRepository = require('../repositories/serviceRepository');

const createEvaluation = async (evaluatorId, evaluated_id, rating, comment) => {

    const numRating = parseInt(rating, 10);
    if (!evaluated_id || !numRating || numRating < 1 || numRating > 5) {
        throw new Error('O ID do usuário avaliado e uma nota entre 1 e 5 são obrigatórios.');
    }


    const completedServices = await serviceRepository.findCompletedBetweenUsers(evaluatorId, evaluated_id);
    if (completedServices.length === 0) {
        throw new Error('Avaliação negada. Você só pode avaliar um usuário após a conclusão de um serviço mútuo.');
    }

    try {
        await evaluationRepository.create(evaluatorId, evaluated_id, numRating, comment);
        return { message: 'Avaliação registrada com sucesso!' };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Você já avaliou este usuário.');
        }
        throw error;
    }
};

const getMyEvaluations = (evaluatedId) => {
    return evaluationRepository.findByEvaluatedId(evaluatedId);
};

module.exports = {
    createEvaluation,
    getMyEvaluations
};
