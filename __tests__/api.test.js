const request = require('supertest');
const app = require('../app'); // Importa o app REAL
const pool = require('../config/database'); // Importa o pool (para ser mockado)

// Mock o banco de dados de teste
jest.mock('../config/database');

describe('Rotas Principais da API (/api)', () => {

    let contratanteToken, contratanteId;
    let profissionalToken, profissionalId;

    // Antes de CADA teste, cria um ambiente limpo
    beforeEach(async () => {
        // Limpa todas as tabelas
        await pool.execute('DELETE FROM users');
        await pool.execute('DELETE FROM contatos');
        await pool.execute('DELETE FROM services');
        await pool.execute('DELETE FROM evaluations');
        await pool.execute('DELETE FROM messages');

        // 1. Criar Contratante
        await request(app).post('/auth/register').send({
            username: 'contratante_api', password: '123', role: 'Contratante',
            nome: 'Api Contratante', email: 'c_api@teste.com', lgpd_consent: true
        });
        
        // 2. Criar Profissional
        await request(app).post('/auth/register').send({
            username: 'profissional_api', password: '123', role: 'Profissional',
            nome: 'Api Profissional', email: 'p_api@teste.com', lgpd_consent: true
        });

        // 3. Logar Contratante
        const loginContratante = await request(app).post('/auth/login').send({
            username: 'contratante_api', password: '123'
        });
        contratanteToken = loginContratante.body.token;
        contratanteId = loginContratante.body.userId;

        // 4. Logar Profissional
        const loginProfissional = await request(app).post('/auth/login').send({
            username: 'profissional_api', password: '123'
        });
        profissionalToken = loginProfissional.body.token;
        profissionalId = loginProfissional.body.userId;
    });

    // Fecha o pool no final
    afterAll(async () => {
        await pool.end();
    });

    // --- Testes de Profissionais (professionalRoutes.js) ---
    describe('GET /api/professionals', () => {
        it('deve buscar profissionais com o token de Contratante', async () => {
            const res = await request(app)
                .get('/api/professionals')
                .set('Authorization', `Bearer ${contratanteToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1); // Só o 'Api Profissional'
        });

        it('deve filtrar profissionais pelo termo de busca', async () => {
            const res = await request(app)
                .get('/api/professionals?search=Api')
                .set('Authorization', `Bearer ${contratanteToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
        });

        it('deve retornar 403 se um Profissional tentar acessar', async () => {
            const res = await request(app)
                .get('/api/professionals')
                .set('Authorization', `Bearer ${profissionalToken}`);
            
            expect(res.statusCode).toEqual(403); // Proibido pelo checkRole
        });
    });

    // --- Testes de Contato (contactRoutes.js) ---
    describe('Fluxo de Contato', () => {
        it('deve permitir um Contratante iniciar contato (POST /api/contacts)', async () => {
            const res = await request(app)
                .post('/api/contacts')
                .set('Authorization', `Bearer ${contratanteToken}`)
                .send({ profissionalId: profissionalId });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toContain('Contato iniciado');
        });

        it('deve permitir um Profissional ver seus contatos (GET /api/my-contacts)', async () => {
            // Setup: Contratante inicia contato
            await request(app).post('/api/contacts')
                .set('Authorization', `Bearer ${contratanteToken}`)
                .send({ profissionalId: profissionalId });

            // Teste: Profissional checa
            const res = await request(app)
                .get('/api/my-contacts')
                .set('Authorization', `Bearer ${profissionalToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].nome_completo).toBe('Api Contratante');
        });
    });

    // --- Testes do Ciclo de Serviço (serviceRoutes.js) ---
    describe('Fluxo de Ciclo de Serviço', () => {
        
        let serviceId;

        // Cria uma proposta de serviço antes de cada teste deste bloco
        beforeEach(async () => {
            const res = await request(app).post('/api/services')
                .set('Authorization', `Bearer ${contratanteToken}`)
                .send({ profissionalId: profissionalId });
            serviceId = res.body.serviceId; // Salva o ID do serviço
        });

        it('deve permitir ao Profissional aprovar um serviço (PUT /api/services/:id/approve)', async () => {
            const res = await request(app)
                .put(`/api/services/${serviceId}/approve`)
                .set('Authorization', `Bearer ${profissionalToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('Serviço iniciado');
        });

        it('deve permitir a conclusão mútua (request + confirm)', async () => {
            // 1. Aprova
            await request(app).put(`/api/services/${serviceId}/approve`)
                .set('Authorization', `Bearer ${profissionalToken}`);
            
            // 2. Contratante solicita conclusão
            const resReq = await request(app)
                .put(`/api/services/${serviceId}/request-complete`)
                .set('Authorization', `Bearer ${contratanteToken}`);
            expect(resReq.statusCode).toEqual(200);

            // 3. Profissional confirma conclusão
            const resConfirm = await request(app)
                .put(`/api/services/${serviceId}/confirm-complete`)
                .set('Authorization', `Bearer ${profissionalToken}`);
            
            expect(resConfirm.statusCode).toEqual(200);
            expect(resConfirm.body.message).toContain('Serviço concluído');

            // 4. Verifica no BD
            const [services] = await pool.execute('SELECT status FROM services WHERE id = ?', [serviceId]);
            expect(services[0].status).toBe('completed');
        });

        it('NÃO deve permitir que o solicitante confirme a conclusão (403)', async () => {
            await request(app).put(`/api/services/${serviceId}/approve`).set('Authorization', `Bearer ${profissionalToken}`);
            await request(app).put(`/api/services/${serviceId}/request-complete`).set('Authorization', `Bearer ${contratanteToken}`);

            // Teste: Contratante (que solicitou) tenta confirmar
            const resConfirm = await request(app)
                .put(`/api/services/${serviceId}/confirm-complete`)
                .set('Authorization', `Bearer ${contratanteToken}`); // <-- Mesmo usuário

            expect(resConfirm.statusCode).toEqual(403);
            expect(resConfirm.body.message).toContain('sua própria solicitação');
        });
    });

    // --- Testes de Avaliação (evaluationRoutes.js) ---
    describe('Fluxo de Avaliação', () => {

        it('NÃO deve permitir avaliação se o serviço não estiver concluído (403)', async () => {
            const res = await request(app)
                .post('/api/evaluations')
                .set('Authorization', `Bearer ${contratanteToken}`)
                .send({ evaluated_id: profissionalId, rating: 5, comment: "Teste" });
            
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toContain('serviço mútuo');
        });
    });

    // --- Testes de Chat (chatRoutes.js) ---
    describe('Fluxo de Chat', () => {
        it('deve buscar o histórico do chat (GET /api/chat/:id/:id)', async () => {
            const res = await request(app)
                .get(`/api/chat/${contratanteId}/${profissionalId}`)
                .set('Authorization', `Bearer ${contratanteToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
    // ✅ ADICIONE ESTE NOVO TESTE (para cobrir professionalController.js):
    it('deve buscar as estatísticas da Visão Geral (GET /api/professional-stats)', async () => {
        // (O 'beforeEach' já criou 'profissionalToken')
        const res = await request(app)
            .get('/api/professional-stats')
            .set('Authorization', `Bearer ${profissionalToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('services_completed');
        expect(res.body).toHaveProperty('clients_served');
        expect(res.body).toHaveProperty('avg_rating');
        expect(res.body.services_completed).toBe(0); // Nenhum serviço foi concluído ainda
    });


    // ✅ ADICIONE ESTE NOVO TESTE (para cobrir evaluationRepository.js):
    it('deve buscar as avaliações recebidas (GET /api/my-evaluations)', async () => {
        // (O 'beforeEach' já criou os tokens)

        // 1. Precisamos de um serviço concluído para poder avaliar
        const resService = await request(app).post('/api/services')
            .set('Authorization', `Bearer ${contratanteToken}`)
            .send({ profissionalId: profissionalId });
        const serviceId = resService.body.serviceId;
        
        await request(app).put(`/api/services/${serviceId}/approve`).set('Authorization', `Bearer ${profissionalToken}`);
        await request(app).put(`/api/services/${serviceId}/request-complete`).set('Authorization', `Bearer ${contratanteToken}`);
        await request(app).put(`/api/services/${serviceId}/confirm-complete`).set('Authorization', `Bearer ${profissionalToken}`);
        
        // 2. Contratante avalia o Profissional
        await request(app).post('/api/evaluations')
            .set('Authorization', `Bearer ${contratanteToken}`)
            .send({ evaluated_id: profissionalId, rating: 5, comment: "Teste de avaliação" });
            
        // 3. Profissional busca suas avaliações
        const res = await request(app)
            .get('/api/my-evaluations')
            .set('Authorization', `Bearer ${profissionalToken}`); // Logado como Profissional

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].comment).toBe("Teste de avaliação");
        expect(res.body[0].evaluator_name).toBe("Api Contratante");
    });

});