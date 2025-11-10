// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt'); 

//Middleware para verificar o Token JWT.

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido. Acesso negado.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro na verificação do token:', err.message);
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        
        // Anexa os dados do usuário ao request
        req.user = user; 
        next(); 
    });
};

module.exports = { verifyToken };