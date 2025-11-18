const serviceRepository = require('../repositories/serviceRepository');

const proposeService = async (contratanteId, profissionalId) => {
    const existing = await serviceRepository.findActiveOrPending(contratanteId, profissionalId);
    if (existing.length > 0) {
        throw new Error('Já existe um serviço ativo ou pendente com este profissional.');
    }
    const serviceId = await serviceRepository.create(contratanteId, profissionalId);
    return { message: 'Proposta de serviço enviada com sucesso.', serviceId };
};

const approveService = async (serviceId, profissionalId) => {
    const affectedRows = await serviceRepository.approve(serviceId, profissionalId);
    if (affectedRows === 0) {
        throw new Error('Proposta não encontrada ou já aceita.');
    }
    return { message: 'Serviço iniciado com sucesso!' };
};

const requestCompletion = async (serviceId, userId) => {
    const affectedRows = await serviceRepository.requestCompletion(serviceId, userId);
    if (affectedRows === 0) {
        throw new Error('Serviço não está ativo ou não pertence a você.');
    }
    return { message: 'Solicitação de conclusão enviada.' };
};

const confirmCompletion = async (serviceId, userId) => {
    const affectedRows = await serviceRepository.confirmCompletion(serviceId, userId);
    if (affectedRows === 0) {
        throw new Error('Solicitação não encontrada, ou você não pode confirmar sua própria solicitação.');
    }
    return { message: 'Serviço concluído com sucesso! Agora você pode avaliá-lo.' };
};

const getChatStatus = async (myId, myRole, otherUserId) => {
    let contratanteId, profissionalId;
    if (myRole === 'Contratante') {
        contratanteId = myId;
        profissionalId = otherUserId;
    } else {
        contratanteId = otherUserId;
        profissionalId = myId;
    }
    
    const service = await serviceRepository.findLatestByUserIds(contratanteId, profissionalId);
    if (!service) {
        return { status: 'none' };
    }
    return service;
};

module.exports = {
    proposeService,
    approveService,
    requestCompletion,
    confirmCompletion,
    getChatStatus
};
