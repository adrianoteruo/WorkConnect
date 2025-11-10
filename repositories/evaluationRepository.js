// repositories/evaluationRepository.js
const pool = require('../config/database');

// Cria uma nova avaliação.
const create = async (evaluatorId, evaluated_id, rating, comment) => {
    const sql = `
        INSERT INTO evaluations (evaluator_id, evaluated_id, rating, comment) 
        VALUES (?, ?, ?, ?)
    `;
    await pool.execute(sql, [evaluatorId, evaluated_id, rating, comment || '']);
};

// Busca todas as avaliações que um usuário recebeu.
const findByEvaluatedId = async (evaluatedId) => {
    const sql = `
        SELECT e.rating, e.comment, e.created_at, u.nome_completo AS evaluator_name 
        FROM evaluations e
        JOIN users u ON e.evaluator_id = u.id
        WHERE e.evaluated_id = ?
        ORDER BY e.created_at DESC
    `;
    const [evaluations] = await pool.execute(sql, [evaluatedId]);
    return evaluations;
};

const getAverageRating = async (evaluatedId) => {
    const [rows] = await pool.execute(
        "SELECT AVG(rating) as avg_rating FROM evaluations WHERE evaluated_id = ?", 
        [evaluatedId]
    );
    return rows[0].avg_rating; 
};

module.exports = {
    create,
    findByEvaluatedId,
    getAverageRating
};