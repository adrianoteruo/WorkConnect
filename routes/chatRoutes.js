// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/chat/:user1_id/:user2_id
router.get(
    '/chat/:user1_id/:user2_id', 
    chatController.getChatHistory 
);

module.exports = router;