// services/authService.js
const userRepository = require('../repositories/userRepository');
const { sendPasswordResetEmail } = require('../config/email');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = require('../config/jwt');

// Lógica de negócio para registrar um novo usuário.
 
const register = async (userData) => {
    const { username, password, role, nome, email, lgpd_consent } = userData;

    //  Validação de campos
    if (!username || !password || !role || !nome || !email) {
        throw new Error('Campos essenciais (usuário, senha, perfil, nome, email) são obrigatórios.');
    }
    if (!lgpd_consent) {
        throw new Error('O consentimento dos termos (LGPD) é obrigatório.');
    }

    //  Checar duplicidade
    const existingUsers = await userRepository.findByEmailOrUsername(username, email);
    if (existingUsers.length > 0) {
        throw new Error('Nome de usuário ou e-mail já existem.');
    }

    //  Criptografar senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //  Salvar no banco
    const newUser = await userRepository.create({ ...userData, hashedPassword });
    return { id: newUser.id, username, role };
};

// Lógica de negócio para logar um usuário.

const login = async (username, password) => {
    //  Validação
    if (!username || !password) {
        throw new Error('Usuário e senha são obrigatórios.');
    }

    //  Buscar usuário
    const [user] = await userRepository.findByEmailOrUsername(username, username); // Permite login com email ou username
    if (!user) {
        throw new Error('Usuário ou senha inválidos.');
    }

    //  Comparar senha
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Usuário ou senha inválidos.');
    }

    //  Gerar Token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    return { token, user: { id: user.id, username: user.username, role: user.role } };
};

// Lógica de negócio para buscar um perfil.
const getProfile = async (profileId) => {
    const user = await userRepository.findById(profileId);
    if (!user) {
        throw new Error('Usuário não encontrado.');
    }
    // Remove dados sensíveis antes de retornar
    const { password, reset_token, reset_token_expires, ...profileData } = user;
    return profileData;
};

// Lógica de negócio para atualizar um perfil.
const updateProfile = async (userId, fieldsToUpdate) => {
    let updateData = { ...fieldsToUpdate };

    if (updateData.nome) {
        updateData.nome_completo = updateData.nome;
        delete updateData.nome; 
    }

    const { password, ...otherFields } = updateData;
    let finalUpdateData = otherFields;

    //  Se a senha for enviada, criptografa-a
    if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        finalUpdateData.password = hashedPassword;
    }
    
    if (Object.keys(finalUpdateData).length === 0) {
        throw new Error('Nenhum dado para atualizar foi fornecido.');
    }

    //  Atualiza no banco
    const affectedRows = await userRepository.update(userId, finalUpdateData);
    if (affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
    }
    return { message: 'Perfil atualizado com sucesso!' };
};


// Lógica de negócio para deletar um perfil.
const deleteProfile = async (userId) => {
    const affectedRows = await userRepository.remove(userId);
    if (affectedRows === 0) {
        throw new Error('Usuário não encontrado.');
    }
    return { message: 'Usuário excluído com sucesso.' };
};

// Lógica de negócio para solicitar redefinição de senha.
 
const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(email);

    // Se não encontrar, NÃO retorna erro (por segurança)
    if (!user) {
        return { message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' };
    }

    //  Gerar token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); 

    //  Salvar token no banco
    await userRepository.saveResetToken(user.id, token, expires);

    //  Criar link e enviar email
    const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);
    
    return { message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' };
};

// Lógica de negócio para redefinir a senha.
const resetPassword = async (token, newPassword) => {
    //  Encontra usuário pelo token
    const user = await userRepository.findByResetToken(token);
    if (!user) {
        throw new Error('Token inválido ou expirado. Por favor, solicite um novo link.');
    }

    //  Criptografa nova senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    //  Atualiza senha e limpa token
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