// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { checkRole } = require('../middleware/roleMiddleware');

// POST /api/contacts
router.post(
    '/contacts', 
    checkRole(['Contratante']), 
    contactController.createContact
);

// GET /api/my-contacts
router.get(
    '/my-contacts', 
    checkRole(['Profissional']), 
    contactController.getMyContacts
);

// GET /api/my-conversations
router.get(
    '/my-conversations', 
    checkRole(['Contratante']), 
    contactController.getMyConversations
);

module.exports = router;