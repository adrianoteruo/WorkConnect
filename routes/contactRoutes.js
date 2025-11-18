const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { checkRole } = require('../middleware/roleMiddleware');


router.post(
    '/contacts', 
    checkRole(['Contratante']), 
    contactController.createContact
);


router.get(
    '/my-contacts', 
    checkRole(['Profissional']), 
    contactController.getMyContacts
);


router.get(
    '/my-conversations', 
    checkRole(['Contratante']), 
    contactController.getMyConversations
);

module.exports = router;
