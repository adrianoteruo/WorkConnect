// controllers/chatController.js
const chatService = require('../services/chatService');

const getChatHistory = async (req, res) => {
    try {
        const { user1_id, user2_id } = req.params;
        const history = await chatService.getChatHistory(user1_id, user2_id);
        res.json(history);
    } catch (error) {
        console.error("Erro ao buscar histórico de chat:", error);
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
};

module.exports = { getChatHistory };