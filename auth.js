const express = require('express');
const router = express.Router();
const pool = require('./serverDatabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const JWT_SECRET = 'token_workconnect'; 


router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const [result] = await pool.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', user: { id: result.insertId, username, role } });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }


        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

        res.json({
            message: 'Login bem-sucedido!',
            token: token, 
            role: user.role,
            username: user.username,
            userId: user.id
        });
        

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido. Acesso negado.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = user;
        next();
    });
};


router.put('/users/:id', async (req, res) => { /* ... seu código ... */ });

router.get('/users', async (req, res) => { /* ... seu código ... */ });

router.get('/users/:id', async (req, res) => { /* ... seu código ... */ });

router.delete('/users/:id', async (req, res) => { /* ... seu código ... */ });



module.exports = { router, verifyToken };
