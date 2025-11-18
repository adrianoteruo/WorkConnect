const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { checkRole } = require('../middleware/roleMiddleware');


router.post(
    '/services', 
    checkRole(['Contratante']), 
    serviceController.proposeService
);


router.put(
    '/services/:id/approve', 
    checkRole(['Profissional']), 
    serviceController.approveService
);


router.put(
    '/services/:id/request-complete', 
    serviceController.requestCompletion 
);


router.put(
    '/services/:id/confirm-complete', 
    serviceController.confirmCompletion 
);

router.get(
    '/services/chat-status/:otherUserId', 
    serviceController.getChatStatus 
);

module.exports = router;
