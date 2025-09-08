const express = require('express');
const router = express.Router();

// Middleware para verificar o papel do usuário
const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.headers['user-role']; // Lê o papel do cabeçalho

        if (userRole && roles.includes(userRole)) {
            next(); // O usuário tem a permissão, continua para a rota
        } else {
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão.' });
        }
    };
};

// Definindo as rotas protegidas
router.get('/contratante', checkRole(['Contratante', 'Admin']), (req, res) => {
    res.json({ message: 'Bem-vindo à área do Contratante!' });
});

router.get('/profissional', checkRole(['Profissional', 'Admin']), (req, res) => {
    res.json({ message: 'Bem-vindo à área do Profissional!' });
});

router.get('/admin', checkRole(['Admin']), (req, res) => {
    res.json({ message: 'Bem-vindo à área de Admin!' });
});

module.exports = router;