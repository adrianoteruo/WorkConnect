const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


router.get(
    '/chat/:user1_id/:user2_id', 
    chatController.getChatHistory 
);

module.exports = router;
