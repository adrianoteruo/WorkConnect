const fs = require('fs').promises; 
const path = require('path');
const CHAT_DIR = path.join(__dirname, '..', 'storage', 'chats');


async function ensureDir() {
    try {
        await fs.access(CHAT_DIR);
    } catch {
        await fs.mkdir(CHAT_DIR, { recursive: true });
    }
}


const getFileName = (user1, user2) => {
    const ids = [parseInt(user1), parseInt(user2)].sort((a, b) => a - b);
    return path.join(CHAT_DIR, `${ids[0]}-${ids[1]}.json`);
};


const saveMessage = async (senderId, receiverId, messageText) => {
    await ensureDir();
    const filePath = getFileName(senderId, receiverId);
    
    const newMessage = {
        sender_id: senderId,
        receiver_id: receiverId,
        message_text: messageText,
        created_at: new Date().toISOString()
    };

    let chatHistory = [];

    try {
        const data = await fs.readFile(filePath, 'utf8');
        chatHistory = JSON.parse(data);
    } catch (error) {
        chatHistory = [];
    }

    chatHistory.push(newMessage);

    await fs.writeFile(filePath, JSON.stringify(chatHistory, null, 2), 'utf8');
    
    return newMessage;
};


const findChatHistory = async (user1_id, user2_id) => {
    const filePath = getFileName(user1_id, user2_id);
    
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

module.exports = { saveMessage, findChatHistory };
