const checkRole = (roles) => {
    return (req, res, next) => {

        const userRole = req.user.role; 

        if (userRole && roles.includes(userRole)) {
            next(); 
        } else {
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão para este recurso.' });
        }
    };
};

module.exports = { checkRole };
