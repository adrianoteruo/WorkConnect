const userRepository = require('../repositories/userRepository');

const getAllUsers = async () => {
    return userRepository.findAll();
};

module.exports = { getAllUsers };
