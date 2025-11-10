// services/professionalService.js
const userRepository = require('../repositories/userRepository');

// Lógica de negócio para buscar profissionais (com ou sem filtro).

const findProfessionals = async (search) => {
    if (search) {
        return userRepository.findProfessionalsByNameOrService(search);
    } else {
        return userRepository.findAllProfessionals();
    }
};

module.exports = { findProfessionals };