const userService = require('../services/userService');

const listUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
};

module.exports = { listUsers };
