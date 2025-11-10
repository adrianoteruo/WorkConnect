const mysql = require('mysql2/promise');

// Conecta ao banco de TESTE
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'workconnect_test' 
};

// Exporta o pool de teste
const pool = mysql.createPool(dbConfig);

module.exports = pool;