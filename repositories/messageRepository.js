const pool = require('../config/database');

const findChatHistory = async (user1_id, user2_id) => {
    const sql = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    `;
    const [history] = await pool.execute(sql, [user1_id, user2_id, user2_id, user1_id]);
    return history;
};

module.exports = { findChatHistory };
