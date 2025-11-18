const messageRepository = require('../repositories/messageRepository');

const getChatHistory = (user1_id, user2_id) => {
    return messageRepository.findChatHistory(user1_id, user2_id);
};

module.exports = { getChatHistory };
