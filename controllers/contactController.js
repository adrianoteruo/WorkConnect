const contactService = require('../services/contactService');

const createContact = async (req, res) => {
    try {
        const contratanteId = req.user.id;
        const { profissionalId } = req.body;
        
        if (!profissionalId) {
            return res.status(400).json({ message: 'O ID do profissional é obrigatório.' });
        }
        
        const result = await contactService.createContact(contratanteId, profissionalId);
        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao iniciar contato:', error);
        if (error.message.includes('Você já entrou')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getMyContacts = async (req, res) => {
    try {
        const profissionalId = req.user.id;
        const contacts = await contactService.getMyContacts(profissionalId);
        res.json(contacts);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

const getMyConversations = async (req, res) => {
    try {
        const contratanteId = req.user.id;
        const conversations = await contactService.getMyConversations(contratanteId);
        res.json(conversations);
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = {
    createContact,
    getMyContacts,
    getMyConversations
};
