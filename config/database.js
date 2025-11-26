const mysql = require('mysql2/promise');


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};


const pool = mysql.createPool(dbConfig);


async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL com sucesso!');
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao MySQL:', error.message);
    }
}

testConnection();


module.exports = pool;
