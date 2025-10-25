const express = require('express');
const { verifyToken } = require('./auth');
const { checkRole } = require('./serverProtect');
const pool = require('./serverDatabase');

const router = express.Router();

// Middleware para proteger todas as rotas da API
router.use(verifyToken);

// ROTA PARA O CONTRATANTE: Ver a lista geral de todos os profissionais
router.get('/professionals', checkRole(['Contratante', 'Admin']), async (req, res) => {
    try {
        const [professionals] = await pool.execute(
            `SELECT id, nome_completo, servico_oferecido, descricao_servico, email, telefone 
             FROM users 
             WHERE role = ?`,
            ['Profissional']
        );
        res.json(professionals);
    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados.' });
    }
});

// ROTA PARA O PROFISSIONAL: Ver os contratantes que entraram em contato com ele
router.get('/my-contacts', checkRole(['Profissional']), async (req, res) => {
    try {
        // O ID do profissional logado é extraído do token JWT.
        const profissionalId = req.user.id;

        const sqlQuery = `
            SELECT 
                u.id, 
                u.nome_completo, 
                u.email, 
                u.telefone,
                u.busca_servico 
            FROM users u
            INNER JOIN contatos c ON u.id = c.contratante_id
            WHERE c.profissional_id = ?
        `;
        
        const [contractors] = await pool.execute(sqlQuery, [profissionalId]);
        
        res.json(contractors);

    } catch (error) {
        console.error('Erro ao buscar contatos do profissional:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar contatos.' });
    }
});



// ROTA PARA O CONTRATANTE: Ver a lista geral de todos os profissionais
router.get('/professionals', checkRole(['Contratante', 'Admin']), async (req, res) => {
    
});

// ROTA PARA O CONTRATANTE: Iniciar contato com um profissional
router.post('/contacts', checkRole(['Contratante']), async (req, res) => {
    // O ID do contratante vem do token JWT
    const contratanteId = req.user.id; 
    
    // O ID do profissional com quem ele quer falar vem do corpo da requisição 
    const { profissionalId } = req.body;

    if (!profissionalId) {
        return res.status(400).json({ message: 'O ID do profissional é obrigatório.' });
    }

    try {
       
        const sql = 'INSERT INTO contatos (contratante_id, profissional_id) VALUES (?, ?)';
        
        await pool.execute(sql, [contratanteId, profissionalId]);

        res.status(201).json({ message: 'Contato iniciado com sucesso! O profissional foi notificado.' });

    } catch (error) {
        // Verifica se o erro é de chave duplicada (o contato já existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já entrou em contato com este profissional.' });
        }
        console.error('Erro ao iniciar contato:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar contato.' });
    }
});


// ROTA  PARA O PROFISSIONAL: Ver os contratantes que entraram em contato com ele
router.get('/my-contacts', checkRole(['Profissional']), async (req, res) => {
    
});



module.exports = router;