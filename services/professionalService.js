const userRepository = require('../repositories/userRepository');


const findProfessionals = async (search) => {
    if (search) {
        return userRepository.findProfessionalsByNameOrService(search);
    } else {
        return userRepository.findAllProfessionals();
    }
};

module.exports = { findProfessionals };
