const API_URL = 'http://localhost:3000';
const socket = io();
const myUserId = localStorage.getItem('userId');
let currentChatPartnerId = null;

// Ouve por novas mensagens que chegam do servidor
socket.on('receiveMessage', (message) => {
    const numMyUserId = parseInt(myUserId, 10);
    const numCurrentChatPartnerId = parseInt(currentChatPartnerId, 10);
    const numMessageSenderId = parseInt(message.sender_id, 10);

    // 1. A mensagem é minha? Se sim, ignora.
    if (numMessageSenderId === numMyUserId) {
        return;
    }

    // 2. A mensagem é da pessoa com quem estou conversando?
    if (numMessageSenderId === numCurrentChatPartnerId) {
        displayMessage(message, numMyUserId);
    } else {
        // 3. É uma mensagem de outra pessoa (não estou vendo o chat dela)
        console.log("Notificação: Nova mensagem de outro usuário.");
    }
});

// Ouve pela atualização de status do serviço vinda do servidor
socket.on('updateServiceStatus', () => {
    console.log("Recebido evento de atualização de status do serviço.");
    
    // Verifica se estamos com um chat aberto
    if (currentChatPartnerId) {
        const myRole = localStorage.getItem('userRole');
        
        // Simplesmente recarrega o painel de status
        // (A função updateServiceStatus está em serviceLifecycle.js)
        updateServiceStatus(myUserId, myRole, currentChatPartnerId);
    }
});


// 1. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token || !myUserId) {
        window.location.href = '/';
        return;
    }

    // Passa o token para as funções que só rodam 1 vez no carregamento
    fetchAllProfessionals(token);
    fetchMyContacts(token); 
    loadUserProfileForEditing(token, myUserId);
    fetchMyEvaluations(token);
    
    // O setup usa o token para as funções de perfil (update/delete)
    setupEventListeners(token, myUserId);
});


// 2. LÓGICA DA INTERFACE
function mostrarSecao(id) {
    document.querySelectorAll('.secao').forEach(secao => {
        secao.classList.remove('ativa');
    });
    document.getElementById(id).classList.add('ativa');
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    const menuIndex = { 'editarPerfil': 0, 'visaoGeral': 1, 'mensagens': 2, 'avaliacoes': 3 };
    const activeLi = document.querySelector(`.sidebar li:nth-child(${menuIndex[id] + 1})`);
    if (activeLi) {
        activeLi.classList.add('active');
    }
}


// 3. FUNÇÕES DE API E LÓGICA PRINCIPAL

async function fetchAllProfessionals(token, searchTerm = '') {
    const container = document.querySelector('#visaoGeral .cards');
    try {
        let apiUrl = `${API_URL}/api/professionals`;
        
        // Se houver um termo de busca, adiciona à URL
        if (searchTerm) {
            apiUrl += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar profissionais.');
        const professionals = await response.json();
        container.innerHTML = '';
        if (professionals.length === 0) {
            container.innerHTML = '<p>Nenhum profissional encontrado.</p>';
            return;
        }
        professionals.forEach(prof => {
            const cardHTML = `
                <div class="card professional-card" 
                     data-professional-id="${prof.id}" 
                     data-professional-name="${prof.nome_completo}">
                    <h3>${prof.nome_completo}</h3>
                    <p>${prof.servico_oferecido || 'Serviço não informado'}</p>
                    <p class="card-hint">Clique para conversar</p>
                </div>
            `;
            container.innerHTML += cardHTML;
        });
    } catch (error) {
        container.innerHTML = `<p style="color: red;">Erro ao carregar profissionais: ${error.message}</p>`;
    }
}

async function fetchMyContacts(token) {
    const listElement = document.getElementById('contact-list');
    if (!listElement) return;

    try {
        const response = await fetch(`${API_URL}/api/my-conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus contatos.');
        const professionals = await response.json();
        
        listElement.innerHTML = ''; 
        if (professionals.length === 0) {
            listElement.innerHTML = '<p>Você ainda não iniciou nenhuma conversa.</p>';
            return;
        }
        
        professionals.forEach(p => {
            const contactHTML = `
                <div class="contact-item" onclick="openChatWithUser(${p.id}, '${p.nome_completo}')">
                    <p><strong>${p.nome_completo}</strong></p>
                    <small>Serviço: ${p.servico_oferecido || 'Não informado'}</small>
                </div>
            `;
            listElement.innerHTML += contactHTML;
        });

    } catch (error) {
        listElement.innerHTML = `<p style="color: red;">Erro ao carregar contatos: ${error.message}</p>`;
    }
}

async function fetchMyEvaluations(token) {
    const container = document.getElementById('avaliacoes'); 
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/api/my-evaluations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar avaliações.');

        const evaluations = await response.json();
    
        container.innerHTML = '<h2>Avaliações</h2>'; 

        if (evaluations.length === 0) {
            container.innerHTML += '<p>Você ainda não recebeu nenhuma avaliação.</p>';
            return;
        }

        evaluations.forEach(ev => {
            const stars = '⭐'.repeat(ev.rating); 
            const evalHTML = `
                <div class="avaliacao">
                  <p><strong>${ev.evaluator_name}</strong></p>
                  <p>${stars} (${ev.rating}/5)</p>
                  <p>${ev.comment || 'Nenhum comentário.'}</p>
                </div>
            `;
            container.innerHTML += evalHTML;
        });

    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        container.innerHTML += '<p style="color: red;">Erro ao carregar avaliações.</p>';
    }
}

async function loadUserProfileForEditing(token, userId) {
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Não foi possível carregar seus dados.');
        const user = await response.json();
        document.getElementById('editNome').value = user.nome_completo || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editTelefone').value = user.telefone || '';
        document.getElementById('editCEP').value = user.cep || '';
        document.getElementById('editRua').value = user.rua || '';
        document.getElementById('editNumero').value = user.numero || '';
        document.getElementById('editComplemento').value = user.complemento || '';
        document.getElementById('editBairro').value = user.bairro || '';
        document.getElementById('editCidade').value = user.cidade || '';
        document.getElementById('editEstado').value = user.estado || '';
        document.getElementById('editServico').value = user.busca_servico || '';
    } catch (error) {
        alert(error.message);
    }
}

async function updateUserProfile(token, userId) {
    const formData = {
        nome: document.getElementById('editNome').value,
        email: document.getElementById('editEmail').value,
        telefone: document.getElementById('editTelefone').value,
        cep: document.getElementById('editCEP').value,
        rua: document.getElementById('editRua').value,
        numero: document.getElementById('editNumero').value,
        complemento: document.getElementById('editComplemento').value,
        bairro: document.getElementById('editBairro').value,
        cidade: document.getElementById('editCidade').value,
        estado: document.getElementById('editEstado').value,
        busca: document.getElementById('editServico').value
    };
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        alert(result.message);
        if (!response.ok) throw new Error(result.message);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
    }
}

async function deleteUserProfile(token, userId) {
    const isConfirmed = window.confirm("Você tem CERTEZA que deseja excluir seu perfil?\n\nEsta ação é irreversível e todos os seus dados serão perdidos.");
    if (!isConfirmed) return;
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            localStorage.clear();
            window.location.href = '/';
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro ao excluir perfil:', error);
        alert('Ocorreu um erro de conexão. Tente novamente.');
    }
}


async function initiateContactAndChat(professionalId, professionalName) {
    const token = localStorage.getItem('token'); // Pega o token na hora
    if (!token) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
           body: JSON.stringify({ profissionalId: professionalId })
        });

        const result = await response.json();

        if (response.ok || response.status === 409) {
            console.log(result.message); 
            
            mostrarSecao('mensagens');
            
            document.querySelector('#mensagens .chat-container').style.display = 'flex';

            initializeChat(professionalId, professionalName);
        } else {
            throw new Error(result.message || 'Falha ao iniciar contato.');
        }

    } catch (error) {
        console.error('Erro ao iniciar contato e chat:', error);
        alert(`Não foi possível iniciar o chat: ${error.message}`);
    }
}

// Abre o chat a partir da lista de contatos
function openChatWithUser(userId, userName) {
    document.querySelector('.chat-container').style.display = 'flex';
    initializeChat(userId, userName);
}


// --- FUNÇÕES DO CHAT ---

function displayMessage(message, currentUserId) {
    const chatBox = document.getElementById('chat-messages');
    const placeholder = chatBox.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();
    const messageDiv = document.createElement('div');
    // Assegura que a comparação é de números
    const messageType = parseInt(message.sender_id, 10) === parseInt(currentUserId, 10) ? 'enviada' : 'recebida';
    messageDiv.className = `mensagem ${messageType}`;
    messageDiv.innerHTML = `<strong>${messageType === 'enviada' ? 'Você' : 'Outro'}:</strong> ${message.message_text}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


async function loadChatHistory(senderId, receiverId) {
    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML = ''; 

    const token = localStorage.getItem('token'); 
    if (!token) {
        chatBox.innerHTML = '<p style="color: red;">Erro: Sessão expirada.</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/chat/${senderId}/${receiverId}`, {
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (!response.ok) { 
            throw new Error('Falha ao carregar o histórico de chat.');
        }

        const history = await response.json();
        
        if (history.length === 0) {
            chatBox.innerHTML = '<p class="chat-placeholder">Ainda não há mensagens.</p>';
        } else {
            history.forEach(message => displayMessage(message, senderId));
        }

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        chatBox.innerHTML = '<p class="chat-placeholder" style="color: red;">Erro ao carregar histórico.</p>';
    }
}


function initializeChat(otherUserId, otherUserName) {
    currentChatPartnerId = otherUserId;
    const myRole = localStorage.getItem('userRole');

    if (!myUserId || !otherUserId) return;
    document.getElementById('chat-with-name').textContent = `Conversando com ${otherUserName}`;
    
    // 1. Entra na sala
    socket.emit('joinChat', { senderId: myUserId, receiverId: otherUserId });
    
    // 2. Carrega o histórico (sem passar o token)
    loadChatHistory(myUserId, otherUserId); 
    
    // 3. Atualiza o status do serviço (sem passar o token)
    updateServiceStatus(myUserId, myRole, otherUserId);
    
    // 4. Configura o botão de enviar
    const sendButton = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('chat-message-input');
    
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);

    newSendButton.onclick = () => {
        const messageText = messageInput.value;
        
        if (messageText.trim()) {
            socket.emit('sendMessage', { 
                senderId: myUserId, 
                receiverId: otherUserId, 
                message: messageText 
            });

            const localMessage = {
                sender_id: myUserId, 
                receiver_id: otherUserId,
                message_text: messageText,
                created_at: new Date() 
            };

            displayMessage(localMessage, myUserId);
            messageInput.value = '';
        }
    };
}

//  CONFIGURAÇÃO DOS EVENT LISTENERS


function setupEventListeners(token, userId) {
    // Formulário de Edição
    document.getElementById('formEditarPerfil').addEventListener('submit', (e) => {
        e.preventDefault();
        updateUserProfile(token, userId);
    });


    // Botão de Excluir
    const deleteButton = document.getElementById('btnExcluirPerfil');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteUserProfile(token, userId);
        });
    }
    const logoutButton = document.getElementById('logout-btn-sidebar');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); 
            window.location.href = '/'; 
        });
    }

    const cepInputEdit = document.getElementById('editCEP');
    if (cepInputEdit) {
        cepInputEdit.addEventListener('blur', () => {
            const cep = cepInputEdit.value.replace(/\D/g, ''); // Pega o valor do input 'editCEP'
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro) {
                            // Preenche os campos de edição de perfil
                            document.getElementById('editRua').value = data.logradouro;
                            document.getElementById('editBairro').value = data.bairro;
                            document.getElementById('editCidade').value = data.localidade;
                            document.getElementById('editEstado').value = data.uf;
                        } else {
                            alert('CEP não encontrado.');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar CEP:', error);
                        alert('Não foi possível buscar o CEP.');
                    });
            }
        });
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            // Pega o token para a nova busca
            const token = localStorage.getItem('token'); 
            fetchAllProfessionals(token, searchTerm);
        });

        //  Faz a busca ao pressionar "Enter"
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                searchBtn.click(); 
            }
        });
    }

    // Cards de Profissionais (para iniciar o chat)
    const professionalsContainer = document.querySelector('#visaoGeral .cards');
    if (professionalsContainer) {
        professionalsContainer.addEventListener('click', (event) => {
            const card = event.target.closest('.professional-card');
            
            if (card) {
                console.log("Card clicado:", card);
                const professionalId = card.dataset.professionalId;
                console.log("ID extraído:", professionalId);

                const professionalName = card.dataset.professionalName;
                
                // Chama a nova função (sem passar o token)
                initiateContactAndChat(professionalId, professionalName);
            }
        });
    }
}
