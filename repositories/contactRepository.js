// repositories/contactRepository.js
const pool = require('../config/database');

// Cria um novo registro de contato.
 
const create = async (contratanteId, profissionalId) => {
    const sql = 'INSERT INTO contatos (contratante_id, profissional_id) VALUES (?, ?)';
    const [result] = await pool.execute(sql, [contratanteId, profissionalId]);
    return result;
};

// Busca os contatos de um Profissional (para 'my-contacts').

const findByProfessionalId = async (profissionalId) => {
    const sql = `
        SELECT u.id, u.nome_completo, u.email, u.telefone, u.busca_servico 
        FROM users u
        INNER JOIN contatos c ON u.id = c.contratante_id
        WHERE c.profissional_id = ?
    `;
    const [contractors] = await pool.execute(sql, [profissionalId]);
    return contractors;
};

// Busca as conversas de um Contratante (para 'my-conversations').
 
const findByContratanteId = async (contratanteId) => {
    const sql = `
        SELECT u.id, u.nome_completo, u.servico_oferecido
        FROM users u
        INNER JOIN contatos c ON u.id = c.profissional_id
        WHERE c.contratante_id = ?
        GROUP BY u.id, u.nome_completo, u.servico_oferecido
    `;
    const [professionals] = await pool.execute(sql, [contratanteId]);
    return professionals;
};

module.exports = {
    create,
    findByProfessionalId,
    findByContratanteId
};