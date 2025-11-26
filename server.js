require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const app = require('./app'); 
const pool = require('./config/database');

const port = process.env.PORT || 3000;


const server = http.createServer(app);

const io = new Server(server);


io.on('connection', (socket) => {
    console.log('Um usuário se conectou:', socket.id);

    socket.on('joinChat', ({ senderId, receiverId }) => {
        const id1 = parseInt(senderId, 10);
        const id2 = parseInt(receiverId, 10);
        const roomName = [id1, id2].sort((a, b) => a - b).join('-');
        socket.join(roomName);
        console.log(`Socket ${socket.id} entrou na sala: ${roomName}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        try {
            const numSenderId = parseInt(senderId, 10);
            const numReceiverId = parseInt(receiverId, 10);
            const roomName = [numSenderId, numReceiverId].sort((a, b) => a - b).join('-');
            
            const sql = 'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)';
            const [result] = await pool.execute(sql, [numSenderId, numReceiverId, message]);
            
            const newMessage = { id: result.insertId, /* ... */ };
            io.to(roomName).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    });

    socket.on('serviceStatusChanged', ({ senderId, otherUserId }) => {
        try {
            const numSenderId = parseInt(senderId, 10);
            const numOtherUserId = parseInt(otherUserId, 10);
            const roomName = [numSenderId, numOtherUserId].sort((a, b) => a - b).join('-');
            io.to(roomName).emit('updateServiceStatus');
            console.log(`Status do serviço atualizado na sala: ${roomName}`);
        } catch (error) {
            console.error("Erro ao processar serviceStatusChanged:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});


server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
