// services/contactService.js
const contactRepository = require('../repositories/contactRepository');

const createContact = async (contratanteId, profissionalId) => {
    try {
        await contactRepository.create(contratanteId, profissionalId);
        return { message: 'Contato iniciado com sucesso! O profissional foi notificado.' };
    } catch (error) {
        // Lida com o erro de chave duplicada
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Você já entrou em contato com este profissional.');
        }
        throw error; 
    }
};

const getMyContacts = (profissionalId) => {
    return contactRepository.findByProfessionalId(profissionalId);
};

const getMyConversations = (contratanteId) => {
    return contactRepository.findByContratanteId(contratanteId);
};

module.exports = {
    createContact,
    getMyContacts,
    getMyConversations
};