const request = require('supertest');
const app = require('../app'); 
const pool = require('../config/database'); 


jest.mock('../config/database');

describe('Rotas de Admin (antigo serverProtect)', () => {

    let contratanteToken, profissionalToken, adminToken;


    beforeEach(async () => {
        await pool.execute('DELETE FROM users');
        

        await request(app).post('/auth/register').send({
            username: 'c_protect', password: '123', role: 'Contratante',
            nome: 'Protect C', email: 'c_protect@teste.com', lgpd_consent: true
        });
        

        await request(app).post('/auth/register').send({
            username: 'p_protect', password: '123', role: 'Profissional',
            nome: 'Protect P', email: 'p_protect@teste.com', lgpd_consent: true
        });
        

        await request(app).post('/auth/register').send({
            username: 'a_protect', password: '123', role: 'Admin',
            nome: 'Protect A', email: 'a_protect@teste.com', lgpd_consent: true
        });


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


    describe('GET /api/users (Admin)', () => {
        
        it('deve permitir o Admin listar todos os usuários', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);
                
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(3); 
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

    // Teste da permissão de Admin 
    describe('DELETE /auth/users/:id (Admin)', () => {

        it('deve permitir que um Admin delete OUTRO usuário (DELETE /auth/users/:id)', async () => {
            const [users] = await pool.execute("SELECT id FROM users WHERE username = 'c_protect'");
            const contratanteId = users[0].id;

            const res = await request(app)
                .delete(`/auth/users/${contratanteId}`)
                .set('Authorization', `Bearer ${adminToken}`); 

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Usuário excluído com sucesso.');
            

            const [deleted] = await pool.execute('SELECT * FROM users WHERE id = ?', [contratanteId]);
            expect(deleted.length).toBe(0);
        });
    });

});
