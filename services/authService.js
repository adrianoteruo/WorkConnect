const userRepository = require('../repositories/userRepository');
const { sendPasswordResetEmail } = require('../config/email');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = require('../config/jwt');


 
const register = async (userData) => {
    const { username, password, role, nome, email, lgpd_consent } = userData;


    if (!username || !password || !role || !nome || !email) {
        throw new Error('Campos essenciais (usuário, senha, perfil, nome, email) são obrigatórios.');
    }
    if (!lgpd_consent) {
        throw new Error('O consentimento dos termos (LGPD) é obrigatório.');
    }


    const existingUsers = await userRepository.findByEmailOrUsername(username, email);
    if (existingUsers.length > 0) {
        throw new Error('Nome de usuário ou e-mail já existem.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  
    const newUser = await userRepository.create({ ...userData, hashedPassword });
    return { id: newUser.id, username, role };
};


const login = async (username, password) => {

    if (!username || !password) {
        throw new Error('Usuário e senha são obrigatórios.');
    }

 
    const [user] = await userRepository.findByEmailOrUsername(username, username); // Permite login com email ou username
    if (!user) {
        throw new Error('Usuário ou senha inválidos.');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Usuário ou senha inválidos.');
    }

  
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    return { token, user: { id: user.id, username: user.username, role: user.role } };
};


const getProfile = async (profileId) => {
    const user = await userRepository.findById(profileId);
    if (!user) {
        throw new Error('Usuário não encontrado.');
    }
 
    const { password, reset_token, reset_token_expires, ...profileData } = user;
    return profileData;
};


const updateProfile = async (userId, fieldsToUpdate) => {
    let updateData = { ...fieldsToUpdate };

    if (updateData.nome) {
        updateData.nome_completo = updateData.nome;
        delete updateData.nome; 
    }

    const { password, ...otherFields } = updateData;
    let finalUpdateData = otherFields;


    if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        finalUpdateData.password = hashedPassword;
    }
    
    if (Object.keys(finalUpdateData).length === 0) {
        throw new Error('Nenhum dado para atualizar foi fornecido.');
    }


    const affectedRows = await userRepository.update(userId, finalUpdateData);
    if (affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
    }
    return { message: 'Perfil atualizado com sucesso!' };
};



const deleteProfile = async (userId) => {
    const affectedRows = await userRepository.remove(userId);
    if (affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
    }
    return { message: 'Usuário excluído com sucesso.' };
};


 
const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(email);

 
    if (!user) {
        return { message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' };
    }


    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); 

 
    await userRepository.saveResetToken(user.id, token, expires);


    const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);
    
    return { message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' };
};


const resetPassword = async (token, newPassword) => {

    const user = await userRepository.findByResetToken(token);
    if (!user) {
        throw new Error('Token inválido ou expirado. Por favor, solicite um novo link.');
    }

  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);


    await userRepository.updatePasswordAndClearToken(user.id, hashedPassword);
    
    return { message: 'Senha atualizada com sucesso! Você já pode fazer o login.' };
};


module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    deleteProfile,
    forgotPassword,
    resetPassword
};
