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
// Alterar usuário 
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (!username && !password && !role) {
        return res.status(400).json({ message: 'Informe ao menos um campo para atualizar.' });
    }

    try {
        // Buscar usuário
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Preparar novos valores
        let newUsername = username || users[0].username;
        let newRole = role || users[0].role;
        let newPassword = users[0].password;

        if (password) {
            const saltRounds = 10;
            newPassword = await bcrypt.hash(password, saltRounds);
        }

        // Atualizar usuário
        await pool.execute(
            'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
            [newUsername, newPassword, newRole, id]
        );

        console.log(`Usuário ${id} atualizado com sucesso.`);
        res.json({ 
            message: 'Usuário atualizado com sucesso!', 
            user: { id, username: newUsername, role: newRole } 
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, username, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Buscar um usuário específico pelo ID
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.execute(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Deletar usuário
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        console.log(`Usuário ${id} deletado com sucesso.`);
        res.json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
