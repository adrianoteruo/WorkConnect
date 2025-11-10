const mysql = require('mysql2/promise');


const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'workconnect'
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar a conexão
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
