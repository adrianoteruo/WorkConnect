const pool = require('../config/database');


const findByEmailOrUsername = async (username, email) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
    );
    return users;
};

 
const findByEmail = async (email) => {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
};

const findById = async (id) => {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
};


const create = async (userData) => {
    const {
        username,
        hashedPassword, 
        role,
        nome,
        email,
        lgpd_consent,
        telefone = null,
        cep = null,
        rua = null,
        numero = null,
        complemento = null,
        bairro = null,
        cidade = null,
        estado = null,
        servico = null,
        descricao = null,
        busca = null
    } = userData;

    const sql = `
        INSERT INTO users (
            username, password, role, nome_completo, email, telefone,
            cep, rua, numero, complemento, bairro, cidade, estado,
            servico_oferecido, descricao_servico, busca_servico,
            lgpd_consent, lgpd_consent_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    

    const values = [
        username, hashedPassword, role, nome, email, telefone,
        cep, rua, numero, complemento, bairro, cidade, estado,
        servico, descricao, busca, lgpd_consent
    ];
    
    const [result] = await pool.execute(sql, values);
    return { id: result.insertId };
};


const update = async (id, fieldsToUpdate) => {

    const fieldEntries = Object.entries(fieldsToUpdate); 
    const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);
    
    values.push(id);

    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
};


const remove = async (id) => {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
};


const saveResetToken = async (id, token, expires) => {
    const [result] = await pool.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expires, id]
    );
    return result.affectedRows;
};


const findByResetToken = async (token) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
    );
    return users[0] || null;
};


 
const updatePasswordAndClearToken = async (id, hashedPassword) => {
    const [result] = await pool.execute(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, id]
    );
    return result.affectedRows;
};


 
const findAllProfessionals = async () => {
    const sql = `
        SELECT 
            u.id, 
            u.nome_completo, 
            u.servico_oferecido, 
            u.descricao_servico, 
            u.email, 
            u.telefone,
            AVG(e.rating) as media_avaliacao,
            COUNT(e.id) as total_avaliacoes
        FROM users u
        LEFT JOIN evaluations e ON u.id = e.evaluated_id
        WHERE u.role = ?
        GROUP BY u.id
    `;
    const [professionals] = await pool.execute(sql, ['Profissional']);
    return professionals;
};


const findProfessionalsByNameOrService = async (search) => {
    const sql = `
        SELECT 
            u.id, 
            u.nome_completo, 
            u.servico_oferecido, 
            u.descricao_servico, 
            u.email, 
            u.telefone,
            AVG(e.rating) as media_avaliacao,
            COUNT(e.id) as total_avaliacoes
        FROM users u
        LEFT JOIN evaluations e ON u.id = e.evaluated_id
        WHERE u.role = ? 
        AND (u.nome_completo LIKE ? OR u.servico_oferecido LIKE ?)
        GROUP BY u.id
    `;
    const searchTerm = `%${search}%`;
    const [professionals] = await pool.execute(sql, ['Profissional', searchTerm, searchTerm]);
    return professionals;
};

const findAll = async () => {

    const [users] = await pool.execute(
        'SELECT id, username, role, nome_completo, email FROM users ORDER BY nome_completo ASC'
    );
    return users;
};


module.exports = {
    findByEmailOrUsername,
    findByEmail,
    findById,
    create,
    update,
    remove,
    saveResetToken,
    findByResetToken,
    updatePasswordAndClearToken,
    findAllProfessionals,
    findProfessionalsByNameOrService,
    findAll
};
