const API_URL = 'http://localhost:3000';


const form = document.getElementById('register-form'); 
const tipoUsuario = document.getElementById('tipoUsuario');
const blocoProfissional = document.getElementById('blocoProfissional');
const blocoContratante = document.getElementById('blocoContratante');


const fotoInput = document.getElementById('foto');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const cepInput = document.getElementById('cep');
const ruaInput = document.getElementById('rua');
const numeroInput = document.getElementById('numero');
const complementoInput = document.getElementById('complemento');
const bairroInput = document.getElementById('bairro');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');
const servicoInput = document.getElementById('servico');
const descricaoInput = document.getElementById('descricao');
const buscaInput = document.getElementById('busca');


if (tipoUsuario) {
    tipoUsuario.addEventListener('change', () => {
        if (tipoUsuario.value === 'Profissional') {
            blocoProfissional.style.display = 'block';
            blocoContratante.style.display = 'none';
        } else if (tipoUsuario.value === 'Contratante') {
            blocoProfissional.style.display = 'none';
            blocoContratante.style.display = 'block';
        } else {
            blocoProfissional.style.display = 'none';
            blocoContratante.style.display = 'none';
        }
    });
}

// CEP automático
if (cepInput) {
    cepInput.addEventListener('blur', () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        ruaInput.value = data.logradouro;
                        bairroInput.value = data.bairro;
                        cidadeInput.value = data.localidade;
                        estadoInput.value = data.uf;
                    } else {
                        alert('CEP não encontrado.');
                    }
                });
        }
    });
}

// Lógica da Foto 
if (fotoInput) {
    fotoInput.addEventListener('change', () => {
        if (fotoInput.files.length > 0) {
            const fileName = fotoInput.files[0].name;
            
            const label = document.querySelector(`label[for='${fotoInput.id}']`);
            if(label) {
                label.textContent = `Foto de Perfil: (${fileName})`;
            }
        }
    });
}





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
 
    const activeButton = Array.from(tabButtons).find(btn => btn.textContent.toLowerCase() === tabName);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Cadastro de usuário 
const registerUser = async (e) => {
    e.preventDefault();

    // Coleta dados 
    const formData = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('tipoUsuario').value,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        servico: document.getElementById('servico').value,
        descricao: document.getElementById('descricao').value,
        busca: document.getElementById('busca').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData) 
        });

        const data = await response.json();
        messageEl.textContent = data.message;
        
        if (response.ok) {
            document.getElementById('register-form').reset();
            document.getElementById('blocoProfissional').style.display = 'none';
            document.getElementById('blocoContratante').style.display = 'none';

            messageEl.style.color = 'green';
            const loginButton = Array.from(document.getElementsByClassName('tab-button')).find(b => b.textContent === 'Login');
            if (loginButton) {
                setTimeout(() => loginButton.click(), 2000);
            }
        } else {
            messageEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        messageEl.textContent = 'Erro ao conectar com o servidor.';
        messageEl.style.color = 'red';
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
            messageEl.textContent = "Login bem-sucedido! Redirecionando...";
            messageEl.style.color = 'green';
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);

        } else {
            messageEl.textContent = data.message;
            messageEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro no login:', error);
        messageEl.textContent = 'Erro ao conectar com o servidor.';
        messageEl.style.color = 'red';
    }
};

// Event Listeners 
if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
}

if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
}
