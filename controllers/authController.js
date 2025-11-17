const authService = require('../services/authService');


const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: user
        });
    } catch (error) {
        console.error('Erro no controller de registro:', error.message);
        if (error.message.includes('obrigatórios') || error.message.includes('LGPD')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('já existem')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { token, user } = await authService.login(username, password);
        
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            username: user.username,
            role: user.role,
            userId: user.id
        });
    } catch (error) {
        console.error('Erro no controller de login:', error.message);
        if (error.message.includes('obrigatórios') || error.message.includes('inválidos')) {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const getProfile = async (req, res) => {
    try {
        const requestedId = parseInt(req.params.id, 10);
        const tokenId = req.user.id;
        const tokenRole = req.user.role; 

        //  Permite se for o usuário ou se for Admin
        if (requestedId !== tokenId && tokenRole !== 'Admin') {
            return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar seu próprio perfil.' });
        }
        
        const profileData = await authService.getProfile(requestedId);
        res.json(profileData);

    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const updateProfile = async (req, res) => {
    try {
        const requestedId = parseInt(req.params.id, 10);
        const tokenId = req.user.id;
        const tokenRole = req.user.role; 

        // Permite se for o usuário ou se for Admin
        if (requestedId !== tokenId && tokenRole !== 'Admin') {
            return res.status(403).json({ message: 'Acesso negado. Você só pode editar seu próprio perfil.' });
        }

        const result = await authService.updateProfile(requestedId, req.body);
        res.json(result);

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        if (error.message.includes('Nenhum dado')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const deleteProfile = async (req, res) => {
     try {
        const requestedId = parseInt(req.params.id, 10);
        const tokenId = req.user.id;
        const tokenRole = req.user.role; 

        // Permite se for o usuário ou se for Admin
        if (requestedId !== tokenId && tokenRole !== 'Admin') {
            return res.status(403).json({ message: 'Acesso negado. Você só pode excluir seu próprio perfil.' });
        }

        const result = await authService.deleteProfile(requestedId);
        res.json(result);

    } catch (error) {
        console.error('Erro ao excluir perfil:', error.message);
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json(result);
    } catch (error) {
        console.error('Erro em forgot-password:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        console.error('Erro em reset-password:', error.message);
        if (error.message.includes('Token inválido')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
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
