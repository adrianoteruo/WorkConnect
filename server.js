const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Importar rotas e o pool do banco de dados
const { router: authRoutes } = require('./auth');
const { protectedRouter } = require('./serverProtect');
const apiRoutes = require('./api');
const pool = require('./serverDatabase');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-role');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Rotas da API
app.use('/auth', authRoutes);
app.use('/protected', protectedRouter);
app.use('/api', apiRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/dashboard', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/contratante', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contratante.html'));
});
app.get('/profissional', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profissional.html'));
});

io.on('connection', (socket) => {
    console.log('Um usuário se conectou:', socket.id);

    socket.on('joinChat', ({ senderId, receiverId }) => {
        const roomName = [senderId, receiverId].sort().join('-');
        socket.join(roomName);
        console.log(`Socket ${socket.id} entrou na sala: ${roomName}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        try {
            const roomName = [senderId, receiverId].sort().join('-');
            const sql = 'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)';
            const [result] = await pool.execute(sql, [senderId, receiverId, message]);
            const newMessage = {
                id: result.insertId,
                sender_id: senderId,
                receiver_id: receiverId,
                message_text: message,
                created_at: new Date()
            };
            io.to(roomName).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});

// Rota de API para buscar o histórico de um chat
app.get('/api/chat/:user1_id/:user2_id', async (req, res) => {
    const { user1_id, user2_id } = req.params;
    try {
        const sql = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;
        const [history] = await pool.execute(sql, [user1_id, user2_id, user2_id, user1_id]);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
});


// Inicia o servidor http
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
