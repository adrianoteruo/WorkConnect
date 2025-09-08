const API_URL = 'http://localhost:3000';

// Elementos do DOM
const logoutBtn = document.getElementById('logout-btn');
const userInfoEl = document.getElementById('user-info');
const contratanteBtn = document.getElementById('contratante-btn');
const profissionalBtn = document.getElementById('profissional-btn');
const adminBtn = document.getElementById('admin-btn');
const apiResponseEl = document.getElementById('api-response');

// Verificar se o usuário está logado
window.addEventListener('load', () => {
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    if (!userRole) {
        // Se não estiver logado, redirecionar para a página inicial
        window.location.href = '/';
        return;
    }
    
    // Exibir informações do usuário
    userInfoEl.textContent = `Logado como: ${username} (${userRole})`;
});

// Acessar rotas protegidas
const accessProtected = async (endpoint) => {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
        apiResponseEl.textContent = 'Você precisa estar logado para acessar esta rota.';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/protected/${endpoint}`, {
            method: 'GET',
            headers: { 'user-role': userRole }
        });

        const data = await response.json();
        
        if (response.ok) {
            apiResponseEl.textContent = `Resposta da API: ${data.message}`;
        } else {
            apiResponseEl.textContent = `Erro: ${data.message}`;
        }
    } catch (error) {
        console.error('Erro ao acessar rota protegida:', error);
        apiResponseEl.textContent = 'Erro ao conectar com o servidor.';
    }
};

// Logout
const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '/';
};

// Event Listeners
logoutBtn.addEventListener('click', logout);
contratanteBtn.addEventListener('click', () => accessProtected('contratante'));
profissionalBtn.addEventListener('click', () => accessProtected('profissional'));
adminBtn.addEventListener('click', () => accessProtected('admin'));