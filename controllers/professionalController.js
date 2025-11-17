const professionalService = require('../services/professionalService');
const serviceRepository = require('../repositories/serviceRepository');
const evaluationRepository = require('../repositories/evaluationRepository');

const getProfessionals = async (req, res) => {
    try {
        const { search } = req.query;
        const professionals = await professionalService.findProfessionals(search);
        res.json(professionals);
    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados.' });
    }
};


const getProfessionalStats = async (req, res) => {
    const profissionalId = req.user.id; 

    try {
        const servicesQuery = serviceRepository.getCompletedServicesCount(profissionalId);
        const clientsQuery = serviceRepository.getDistinctClientsCount(profissionalId);
        const ratingQuery = evaluationRepository.getAverageRating(profissionalId);

        const [
            services_completed,
            clients_served,
            avg_rating
        ] = await Promise.all([servicesQuery, clientsQuery, ratingQuery]);

        const stats = {
            services_completed: services_completed,
            clients_served: clients_served,
            avg_rating: avg_rating 
        };

        res.json(stats);

    } catch (error) {
        console.error("Erro ao buscar estatísticas do profissional:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

module.exports = { 
    getProfessionals, 
    getProfessionalStats 
};
