const pool = require('../config/database');


const findLatestByUserIds = async (contratanteId, profissionalId) => {
    const sql = `
        SELECT id, status, contratante_id, profissional_id, requested_by_id
        FROM services 
        WHERE contratante_id = ? AND profissional_id = ?
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    const [services] = await pool.execute(sql, [contratanteId, profissionalId]);
    return services[0] || null;
};


 
const findActiveOrPending = async (contratanteId, profissionalId) => {
    const [existing] = await pool.execute(
        `SELECT id FROM services 
         WHERE contratante_id = ? AND profissional_id = ? 
         AND (status = 'pending' OR status = 'active')`,
        [contratanteId, profissionalId]
    );
    return existing;
};


const create = async (contratanteId, profissionalId) => {
    const sql = 'INSERT INTO services (contratante_id, profissional_id, status) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [contratanteId, profissionalId, 'pending']);
    return result.insertId;
};


const approve = async (serviceId, profissionalId) => {
    const sql = `
        UPDATE services 
        SET status = 'active', started_at = NOW() 
        WHERE id = ? AND profissional_id = ? AND status = 'pending'
    `;
    const [result] = await pool.execute(sql, [serviceId, profissionalId]);
    return result.affectedRows;
};



const requestCompletion = async (serviceId, userId) => {
    const sql = `
        UPDATE services 
        SET status = 'completion_requested', requested_by_id = ? 
        WHERE id = ? 
        AND (contratante_id = ? OR profissional_id = ?) 
        AND status = 'active'
    `;
    const [result] = await pool.execute(sql, [userId, serviceId, userId, userId]);
    return result.affectedRows;
};



const confirmCompletion = async (serviceId, userId) => {
    const sql = `
        UPDATE services 
        SET status = 'completed', completed_at = NOW() 
        WHERE id = ? 
        AND status = 'completion_requested'
        AND requested_by_id != ? 
        AND (contratante_id = ? OR profissional_id = ?)
    `;
    const [result] = await pool.execute(sql, [serviceId, userId, userId, userId]);
    return result.affectedRows;
};


 
const findCompletedBetweenUsers = async (userA, userB) => {
    const sql = `
        SELECT id FROM services 
        WHERE 
            ( (contratante_id = ? AND profissional_id = ?) OR 
              (contratante_id = ? AND profissional_id = ?) )
        AND status = 'completed'
    `;
    const [services] = await pool.execute(sql, [userA, userB, userB, userA]);
    return services;
};

const getCompletedServicesCount = async (profissionalId) => {
    const [rows] = await pool.execute(
        "SELECT COUNT(*) as count FROM services WHERE profissional_id = ? AND status = 'completed'", 
        [profissionalId]
    );
    return rows[0].count || 0;
};

const getDistinctClientsCount = async (profissionalId) => {
    const [rows] = await pool.execute(
        "SELECT COUNT(DISTINCT contratante_id) as count FROM services WHERE profissional_id = ? AND status = 'completed'", 
        [profissionalId]
    );
    return rows[0].count || 0;
};

module.exports = {
    findLatestByUserIds,
    findActiveOrPending,
    create,
    approve,
    requestCompletion,
    confirmCompletion,
    findCompletedBetweenUsers,
    getCompletedServicesCount,
    getDistinctClientsCount
};
