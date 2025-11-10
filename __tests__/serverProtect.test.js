const request = require('supertest');
const app = require('../app'); // Importa o app REAL
const pool = require('../config/database'); // Importa o pool (para ser mockado)

// Mock o banco de dados
jest.mock('../config/database');

describe('Rotas de Admin (antigo serverProtect)', () => {

    let contratanteToken, profissionalToken, adminToken;

    // Antes de cada teste, cria os 3 tipos de usuários
    beforeEach(async () => {
        await pool.execute('DELETE FROM users');
        
        // Criar Contratante
        await request(app).post('/auth/register').send({
            username: 'c_protect', password: '123', role: 'Contratante',
            nome: 'Protect C', email: 'c_protect@teste.com', lgpd_consent: true
        });
        
        // Criar Profissional
        await request(app).post('/auth/register').send({
            username: 'p_protect', password: '123', role: 'Profissional',
            nome: 'Protect P', email: 'p_protect@teste.com', lgpd_consent: true
        });
        
        // Criar Admin
        await request(app).post('/auth/register').send({
            username: 'a_protect', password: '123', role: 'Admin',
            nome: 'Protect A', email: 'a_protect@teste.com', lgpd_consent: true
        });

        // Logar todos
        const loginC = await request(app).post('/auth/login').send({ username: 'c_protect', password: '123' });
        contratanteToken = loginC.body.token;
        
        const loginP = await request(app).post('/auth/login').send({ username: 'p_protect', password: '123' });
        profissionalToken = loginP.body.token;

        const loginA = await request(app).post('/auth/login').send({ username: 'a_protect', password: '123' });
        adminToken = loginA.body.token;
    });

    afterAll(async () => {
        await pool.end();
    });

    // Teste da nova rota de Admin (substitui o /protected/admin)
    describe('GET /api/users (Admin)', () => {
        
        it('deve permitir o Admin listar todos os usuários', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);
                
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(3); // Os 3 usuários que criamos
        });

        it('NÃO deve permitir que um Contratante liste usuários (403)', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${contratanteToken}`);
            
            expect(res.statusCode).toEqual(403);
        });

        it('NÃO deve permitir que um Profissional liste usuários (403)', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${profissionalToken}`);
            
            expect(res.statusCode).toEqual(403);
        });
    });

    // Teste da permissão de Admin (que adicionamos no authController)
    describe('DELETE /auth/users/:id (Admin)', () => {

        it('deve permitir que um Admin delete OUTRO usuário (DELETE /auth/users/:id)', async () => {
            // 1. Pega o ID do Contratante (que será deletado)
            const [users] = await pool.execute("SELECT id FROM users WHERE username = 'c_protect'");
            const contratanteId = users[0].id;

            // 2. Admin tenta excluir
            const res = await request(app)
                .delete(`/auth/users/${contratanteId}`)
                .set('Authorization', `Bearer ${adminToken}`); // Logado como Admin

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Usuário excluído com sucesso.');
            
            // 3. Verifica no BD
            const [deleted] = await pool.execute('SELECT * FROM users WHERE id = ?', [contratanteId]);
            expect(deleted.length).toBe(0);
        });
    });

});