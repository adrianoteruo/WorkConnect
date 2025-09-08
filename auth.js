const express = require('express');
const router = express.Router();
const pool = require('./serverDatabase');
const bcrypt = require('bcrypt');

// Cadastro de usuário
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verificar se o usuário já existe
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserir novo usuário
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        console.log(`Novo usuário registrado: ${username} com o papel de ${role}`);
        res.status(201).json({ 
            message: 'Usuário registrado com sucesso!', 
            user: { id: result.insertId, username, role } 
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Login de usuário
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar usuário no banco
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = users[0];

        // Verificar senha
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        console.log(`Login bem-sucedido para o usuário: ${username}`);
        res.json({ 
            message: 'Login bem-sucedido!', 
            role: user.role,
            userId: user.id
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;