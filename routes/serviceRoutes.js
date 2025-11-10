// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { checkRole } = require('../middleware/roleMiddleware');

// POST /api/services
router.post(
    '/services', 
    checkRole(['Contratante']), 
    serviceController.proposeService
);

// PUT /api/services/:id/approve
router.put(
    '/services/:id/approve', 
    checkRole(['Profissional']), 
    serviceController.approveService
);

// PUT /api/services/:id/request-complete
router.put(
    '/services/:id/request-complete', 
    serviceController.requestCompletion 
);

// PUT /api/services/:id/confirm-complete
router.put(
    '/services/:id/confirm-complete', 
    serviceController.confirmCompletion 
);

// GET /api/services/chat-status/:otherUserId
router.get(
    '/services/chat-status/:otherUserId', 
    serviceController.getChatStatus 
);

module.exports = router;