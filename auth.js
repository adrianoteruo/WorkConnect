const express = require('express');
const router = express.Router();
const pool = require('./serverDatabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 


const JWT_SECRET = 'token_workconnect'; 




router.post('/register', async (req, res) => {
   
    const {
        username, password, role, nome, email, telefone,
        cep, rua, numero, complemento, bairro, cidade, estado,
        servico, descricao, busca
    } = req.body;

   
    if (!username || !password || !role || !nome || !email) {
        return res.status(400).json({ message: 'Campos essenciais (usuário, senha, perfil, nome, email) são obrigatórios.' });
    }

    try {
        // Verifica se o nome de usuário ou email já existem
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Nome de usuário ou e-mail já existem.' });
        }

        // Criptografa a senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Monta a query SQL para inserir o novo usuário com todos os dados
        const sql = `
            INSERT INTO users (
                username, password, role, nome_completo, email, telefone,
                cep, rua, numero, complemento, bairro, cidade, estado,
                servico_oferecido, descricao_servico, busca_servico
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            username, hashedPassword, role, nome, email, telefone,
            cep, rua, numero, complemento, bairro, cidade, estado,
            servico, // servico_oferecido
            descricao, // descricao_servico
            busca // busca_servico
        ];

        const [result] = await pool.execute(sql, values);

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: { id: result.insertId, username, role }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    //  Validação básica
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        //  Buscar o usuário no banco de dados
        const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);

        // Verifica se o usuário existe
        if (users.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        const user = users[0];

        // 3. Comparar a senha fornecida com o hash armazenado
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
        }

        // 4. Se a senha estiver correta, gerar o Token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, // Dados que irão no token
            JWT_SECRET,                                               // Chave secreta
            { expiresIn: '1h' }                                       // Opções (ex: token expira em 1 hora)
        );

        //  Enviar a resposta de sucesso com o token e dados do usuário
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            username: user.username,
            role: user.role,
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

// Visualizar um perfil de usuário específico (apenas o próprio usuário)
router.get('/users/:id', verifyToken, async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const tokenId = req.user.id;

    // Garante que o usuário só pode acessar seus próprios dados
    if (requestedId !==tokenId) {
        return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar seu próprio perfil.' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, username, role, nome_completo, email, telefone, cep, rua, numero, complemento, bairro, cidade, estado, servico_oferecido, descricao_servico, busca_servico FROM users WHERE id = ?',
            [requestedId]
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

// Atualizar  perfil de usuário (apenas o próprio usuário)
router.put('/users/:id', verifyToken, async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const tokenId = req.user.id;

    if (requestedId !==tokenId) {
        return res.status(403).json({ message: 'Acesso negado. Você só pode editar seu próprio perfil.' });
    }

    const {
        nome, email, telefone, cep, rua, numero, complemento, bairro, cidade, estado,
        servico, descricao, busca, password 
    } = req.body;

    try {
        const fields = [];
        const values = [];

       
        if (nome) { fields.push('nome_completo = ?'); values.push(nome); }
        if (email) { fields.push('email = ?'); values.push(email); }
        if (telefone) { fields.push('telefone = ?'); values.push(telefone); }
        if (cep) { fields.push('cep = ?'); values.push(cep); }
        if (rua) { fields.push('rua = ?'); values.push(rua); }
        if (numero) { fields.push('numero = ?'); values.push(numero); }
        if (complemento) { fields.push('complemento = ?'); values.push(complemento); }
        if (bairro) { fields.push('bairro = ?'); values.push(bairro); }
        if (cidade) { fields.push('cidade = ?'); values.push(cidade); }
        if (estado) { fields.push('estado = ?'); values.push(estado); }
        if (servico) { fields.push('servico_oferecido = ?'); values.push(servico); }
        if (descricao) { fields.push('descricao_servico = ?'); values.push(descricao); }
        if (busca) { fields.push('busca_servico = ?'); values.push(busca); }
        
        // Se uma nova senha foi enviada, criptografa e adiciona à query
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            fields.push('password = ?');
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nenhum dado para atualizar foi fornecido.' });
        }

    
        values.push(requestedId);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

        const [result] = await pool.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Perfil atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Excluir um perfil de usuário (apenas o próprio usuário)
router.delete('/users/:id', verifyToken, async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const tokenId = req.user.id;

    if (requestedId !==tokenId) {
        return res.status(403).json({ message: 'Acesso negado. Você só pode excluir seu próprio perfil.' });
    }

    try {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [requestedId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});





module.exports = { router, verifyToken };
