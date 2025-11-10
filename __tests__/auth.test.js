const request = require('supertest');
const app = require('../app'); // <-- 1. Importa o app REAL
const pool = require('../config/database'); // <-- 2. Importa o pool (para mock)

// 3. Informa ao Jest para mockar o banco de dados (caminho correto)
jest.mock('../config/database');

// 4. (O app falso foi removido)

// 5. Define os testes
describe('Rotas de Autenticação (/auth)', () => {

    // Antes de CADA teste, limpa a tabela de usuários
    beforeEach(async () => {
        // Agora 'pool' se refere ao 'workconnect_test'
        await pool.execute('DELETE FROM users');
    });

    // No final de TODOS os testes, fecha a conexão do pool de teste
    afterAll(async () => {
        await pool.end();
    });

    // --- Testes de Registro (POST /register) ---
    describe('POST /register', () => {
        it('deve registrar um novo usuário (Contratante) com sucesso', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    username: 'contratante_teste',
                    password: '123',
                    role: 'Contratante',
                    nome: 'Teste Contratante',
                    email: 'contratante@teste.com',
                    lgpd_consent: true // <-- 6. ADICIONADO DADO OBRIGATÓRIO
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe('Usuário registrado com sucesso!');

            // Verifica se foi salvo no BD de teste
            const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', ['contratante_teste']);
            expect(users.length).toBe(1);
            expect(users[0].email).toBe('contratante@teste.com');
        });

        it('deve falhar ao registrar com email duplicado (409)', async () => {
            // Primeiro usuário
            await request(app).post('/auth/register').send({
                username: 'user1', password: '123', role: 'Contratante', nome: 'User 1', email: 'duplicado@teste.com', lgpd_consent: true // <-- 6. ADICIONADO
            });

            // Segundo usuário (mesmo email)
            const res = await request(app).post('/auth/register').send({
                username: 'user2', password: '123', role: 'Profissional', nome: 'User 2', email: 'duplicado@teste.com', lgpd_consent: true // <-- 6. ADICIONADO
            });

            expect(res.statusCode).toEqual(409); // 409 Conflict
            expect(res.body.message).toBe('Nome de usuário ou e-mail já existem.');
        });

        it('deve falhar se campos obrigatórios estiverem faltando (400)', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ username: 'sem_senha' }); // Faltando senha, role, nome, email

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Campos essenciais (usuário, senha, perfil, nome, email) são obrigatórios.');
        });

        it('deve falhar se o consentimento LGPD não for enviado (400)', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    username: 'user_sem_lgpd',
                    password: '123',
                    role: 'Contratante',
                    nome: 'Teste LGPD',
                    email: 'lgpd@teste.com'
                    // lgpd_consent: true <-- FALTANDO
                });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('O consentimento dos termos (LGPD) é obrigatório.');
        });
    });

    // --- Testes de Login (POST /login) ---
    describe('POST /login', () => {
        // Registra um usuário antes dos testes de login
        beforeEach(async () => {
            await request(app).post('/auth/register').send({
                username: 'user_login',
                password: 'password123',
                role: 'Profissional',
                nome: 'User Login',
                email: 'login@teste.com',
                lgpd_consent: true // <-- 6. ADICIONADO
            });
        });

        it('deve logar com sucesso e retornar um token', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    username: 'user_login',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Login bem-sucedido!');
            expect(res.body).toHaveProperty('token');
        });

        it('deve falhar login com senha errada (401)', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    username: 'user_login',
                    password: 'senha_errada'
                });
            
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Usuário ou senha inválidos.');
        });

        it('deve falhar login com usuário inexistente (401)', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    username: 'usuario_nao_existe',
                    password: '123'
                });
            
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Usuário ou senha inválidos.');
        });
    });

    // --- Testes de Gerenciamento de Perfil (PUT / DELETE) ---
    describe('Gerenciamento de Perfil (Rotas Protegidas)', () => {
        let token;
        let userId;

        beforeEach(async () => {
            // 1. Registra
            await request(app).post('/auth/register').send({
                username: 'user_perfil', password: '123', role: 'Contratante', nome: 'User Perfil', email: 'perfil@teste.com', lgpd_consent: true // <-- 6. ADICIONADO
            });

            // 2. Loga
            const loginRes = await request(app).post('/auth/login').send({
                username: 'user_perfil', password: '123'
            });
            
            token = loginRes.body.token; 
            userId = loginRes.body.userId;
        });

        it('deve atualizar o perfil do próprio usuário (PUT /users/:id)', async () => {
            const res = await request(app)
                .put(`/auth/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nome: 'Novo Nome Atualizado',
                    telefone: '99999-8888'
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Perfil atualizado com sucesso!');

            const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
            expect(users[0].nome_completo).toBe('Novo Nome Atualizado');
        });

        it('NÃO deve permitir atualizar o perfil de outro usuário (403)', async () => {
            const outroUserId = 9999;
            const res = await request(app)
                .put(`/auth/users/${outroUserId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ nome: 'Nome Malicioso' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Acesso negado. Você só pode editar seu próprio perfil.');
        });

        it('deve excluir o perfil do próprio usuário (DELETE /users/:id)', async () => {
            // 1. Registra e loga usuário novo SÓ para este teste
            await request(app).post('/auth/register').send({
                username: 'user_delete', password: '123', role: 'Contratante', nome: 'User Delete', email: 'delete@teste.com', lgpd_consent: true // <-- 6. ADICIONADO
            });
            const loginRes = await request(app).post('/auth/login').send({
                username: 'user_delete', password: '123'
            });
            const tokenDelete = loginRes.body.token;
            const idDelete = loginRes.body.userId;

            // 2. Tenta excluir
            const res = await request(app)
                .delete(`/auth/users/${idDelete}`)
                .set('Authorization', `Bearer ${tokenDelete}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Usuário excluído com sucesso.');

            // 3. Verifica se foi excluído
            const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [idDelete]);
            expect(users.length).toBe(0);
        });
    });
    describe('Fluxo de Redefinição de Senha', () => {
        let user;

        // Cria um usuário base para os testes
        beforeEach(async () => {
            const res = await request(app).post('/auth/register').send({
                username: 'user_reset', password: '123', role: 'Contratante',
                nome: 'User Reset', email: 'reset@teste.com', lgpd_consent: true
            });
            
            // Pega o ID do usuário recém-criado
            const [users] = await pool.execute("SELECT id FROM users WHERE username = 'user_reset'");
            user = users[0];
        });

        it('deve lidar com o pedido de redefinição (POST /forgot-password)', async () => {
            const res = await request(app)
                .post('/auth/forgot-password')
                .send({ email: 'reset@teste.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('link de recuperação foi enviado');
            
            // Verifica se o token foi salvo no BD
            const [users] = await pool.execute('SELECT reset_token FROM users WHERE id = ?', [user.id]);
            expect(users[0].reset_token).toBeDefined();
            expect(users[0].reset_token).not.toBeNull();
        });

        it('deve redefinir a senha com um token válido (POST /reset-password)', async () => {
            // 1. Gera o token
            await request(app).post('/auth/forgot-password').send({ email: 'reset@teste.com' });
            
            // 2. Pega o token direto do BD (simulando o clique no link do email)
            const [users] = await pool.execute('SELECT reset_token FROM users WHERE id = ?', [user.id]);
            const token = users[0].reset_token;

            // 3. Tenta redefinir a senha
            const res = await request(app)
                .post('/auth/reset-password')
                .send({
                    token: token,
                    newPassword: 'nova_senha_123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Senha atualizada com sucesso! Você já pode fazer o login.');

            // 4. Verifica se o login funciona com a nova senha
            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    username: 'user_reset',
                    password: 'nova_senha_123'
                });
            expect(loginRes.statusCode).toEqual(200);
        });
    });


});