const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth'); 

// Aplica o middleware de verificação de token a todas as rotas deste arquivo
router.use(verifyToken);

// Middleware para verificar o papel do usuário a partir do token decodificado
const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role; 

        if (userRole && roles.includes(userRole)) {
            next();
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

// Exporta o roteador E o middleware checkRole para ser usado em outros lugares
module.exports = { protectedRouter: router, checkRole };
