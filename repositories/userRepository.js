// repositories/userRepository.js
const pool = require('../config/database');

// Busca um usuário pelo username OU email.

const findByEmailOrUsername = async (username, email) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
    );
    return users;
};

// Busca um usuário apenas pelo e-mail. Usado pelo 'forgot-password'.
 
const findByEmail = async (email) => {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
};

// Busca um usuário apenas pelo ID.
const findById = async (id) => {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
};

//Cria um novo usuário no banco de dados.
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

// Atualiza um usuário no banco de dados.
const update = async (id, fieldsToUpdate) => {
    // Gera a parte SET da query dinamicamente
    const fieldEntries = Object.entries(fieldsToUpdate); 
    const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = fieldEntries.map(([, value]) => value);
    
    // Adiciona o ID ao final do array de valores para o 'WHERE'
    values.push(id);

    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
};

//Deleta um usuário do banco.
const remove = async (id) => {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
};

//Salva o token de redefinição de senha.
const saveResetToken = async (id, token, expires) => {
    const [result] = await pool.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expires, id]
    );
    return result.affectedRows;
};

// Busca um usuário pelo token de redefinição (e checa a validade).
const findByResetToken = async (token) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
    );
    return users[0] || null;
};

//Salva a nova senha e limpa o token de redefinição.
 
const updatePasswordAndClearToken = async (id, hashedPassword) => {
    const [result] = await pool.execute(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, id]
    );
    return result.affectedRows;
};

// Busca todos os usuários com o perfil 'Profissional'.
 
const findAllProfessionals = async () => {
    const sql = `
        SELECT id, nome_completo, servico_oferecido, descricao_servico, email, telefone 
        FROM users 
        WHERE role = ?
    `;
    const [professionals] = await pool.execute(sql, ['Profissional']);
    return professionals;
};

// Busca Profissionais filtrando por nome ou serviço (para o search).
const findProfessionalsByNameOrService = async (search) => {
    const sql = `
        SELECT id, nome_completo, servico_oferecido, descricao_servico, email, telefone 
        FROM users 
        WHERE role = ? 
        AND (nome_completo LIKE ? OR servico_oferecido LIKE ?)
    `;
    const searchTerm = `%${search}%`;
    const [professionals] = await pool.execute(sql, ['Profissional', searchTerm, searchTerm]);
    return professionals;
};

const findAll = async () => {
    // Exclui senhas e tokens da consulta
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