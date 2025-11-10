// middleware/roleMiddleware.js

//Middleware para verificar o perfil do usuário.
const checkRole = (roles) => {
    return (req, res, next) => {
        // req.user é anexado pelo middleware verifyToken
        const userRole = req.user.role; 

        if (userRole && roles.includes(userRole)) {
            next(); // O usuário tem o perfil permitido
        } else {
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão para este recurso.' });
        }
    };
};

module.exports = { checkRole };