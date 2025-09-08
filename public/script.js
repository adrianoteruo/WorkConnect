const API_URL = 'http://localhost:3000';

// Elementos do DOM
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const messageEl = document.getElementById('message');

// Função para alternar entre abas
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Cadastro de usuário
const registerUser = async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();
        messageEl.textContent = data.message;
        
        if (response.ok) {
            // Limpar formulário após cadastro bem-sucedido
            document.getElementById('register-form').reset();
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        messageEl.textContent = 'Erro ao conectar com o servidor.';
    }
};

// Login de usuário
const loginUser = async (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Armazenar informações do usuário
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', username);
            
            // Redirecionar para o dashboard
            window.location.href = '/dashboard';
        } else {
            messageEl.textContent = data.message;
        }
    } catch (error) {
        console.error('Erro no login:', error);
        messageEl.textContent = 'Erro ao conectar com o servidor.';
    }
};

// Event Listeners
if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
}

if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
}