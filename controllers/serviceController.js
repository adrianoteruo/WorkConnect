// controllers/serviceController.js
const serviceService = require('../services/serviceService');

// Lida com erros comuns dos serviços
const handleServiceError = (res, error) => {
    console.error("Erro no ServiceController:", error.message);
    
    if (error.message.includes('Já existe')) {
        return res.status(409).json({ message: error.message });
    }
    // Checa o erro 403 
    if (error.message.includes('não pode confirmar')) {
        return res.status(403).json({ message: error.message });
    }
    // Checa o erro 404 (
    if (error.message.includes('não encontrada') || error.message.includes('não está ativo')) {
        return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Erro interno do servidor.' });
};

const proposeService = async (req, res) => {
    try {
        const contratanteId = req.user.id;
        const { profissionalId } = req.body;
        if (!profissionalId) {
            return res.status(400).json({ message: 'O ID do profissional é obrigatório.' });
        }
        const result = await serviceService.proposeService(contratanteId, profissionalId);
        res.status(201).json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

const approveService = async (req, res) => {
    try {
        const profissionalId = req.user.id;
        const serviceId = req.params.id;
        const result = await serviceService.approveService(serviceId, profissionalId);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

const requestCompletion = async (req, res) => {
    try {
        const userId = req.user.id;
        const serviceId = req.params.id;
        const result = await serviceService.requestCompletion(serviceId, userId);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

const confirmCompletion = async (req, res) => {
    try {
        const userId = req.user.id;
        const serviceId = req.params.id;
        const result = await serviceService.confirmCompletion(serviceId, userId);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
};

const getChatStatus = async (req, res) => {
    try {
        const myId = req.user.id;
        const myRole = req.user.role;
        const otherUserId = req.params.otherUserId;
        const status = await serviceService.getChatStatus(myId, myRole, otherUserId);
        res.json(status);
    } catch (error) {
        console.error("Erro ao buscar status do chat:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    proposeService,
    approveService,
    requestCompletion,
    confirmCompletion,
    getChatStatus
};