const API_URL = 'http://localhost:3000';
const socket = io();
const myUserId = localStorage.getItem('userId');
let currentChatPartnerId = null;


socket.on('receiveMessage', (message) => {
    const numMyUserId = parseInt(myUserId, 10);
    const numCurrentChatPartnerId = parseInt(currentChatPartnerId, 10);
    const numMessageSenderId = parseInt(message.sender_id, 10);

    if (numMessageSenderId === numMyUserId) {
        return;
    }

    if (numMessageSenderId === numCurrentChatPartnerId) {
        displayMessage(message, numMyUserId);
    } else {
        console.log("Notificação: Nova mensagem de outro usuário.");
    }
});


socket.on('updateServiceStatus', () => {
    console.log("Recebido evento de atualização de status do serviço.");
    

    if (currentChatPartnerId) {
        const myRole = localStorage.getItem('userRole');
        updateServiceStatus(myUserId, myRole, currentChatPartnerId);
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token || !myUserId) {
        window.location.href = '/';
        return;
    }
    fetchMyContacts(token); 
    loadUserProfileForEditing(token, myUserId);
    fetchMyEvaluations(token);
    fetchProfessionalStats(token); 
    
    setupEventListeners(token, myUserId);
});



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



async function fetchMyContacts(token) {
    const listElement = document.getElementById('contact-list');
    if (!listElement) return;

    try {

        const response = await fetch(`${API_URL}/api/my-contacts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus contatos.');
        const contractors = await response.json();
        
        listElement.innerHTML = ''; 
        if (contractors.length === 0) {
            listElement.innerHTML = '<p>Nenhum contratante entrou em contato.</p>';
            return;
        }
        
        contractors.forEach(c => {
            const contactHTML = `
                <div class="contact-item" onclick="openChatWithUser(${c.id}, '${c.nome_completo}')">
                    <p><strong>${c.nome_completo}</strong></p>
                    <small>Busca por: ${c.busca_servico || 'Não informado'}</small>
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


async function fetchProfessionalStats(token) {
    try {
        const response = await fetch(`${API_URL}/api/professional-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar estatísticas.');
        
        const stats = await response.json();

        document.getElementById('stats-services').textContent = stats.services_completed;
        document.getElementById('stats-clients').textContent = stats.clients_served;

        if (stats.avg_rating) {
            const avg = parseFloat(stats.avg_rating).toFixed(1);
            document.getElementById('stats-rating').textContent = `${avg} ⭐`;
        } else {
            document.getElementById('stats-rating').textContent = 'N/A';
        }

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('stats-services').textContent = '—';
        document.getElementById('stats-clients').textContent = '—';
        document.getElementById('stats-rating').textContent = '—';
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
        document.getElementById('editServico').value = user.servico_oferecido || '';
        document.getElementById('editDescricao').value = user.descricao_servico || '';
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
        servico: document.getElementById('editServico').value,
        descricao: document.getElementById('editDescricao').value
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

    if (!confirm("Você tem CERTEZA que deseja excluir seu perfil?\n\nEsta ação é irreversível.")) {
        return;
    }

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


function openChatWithUser(userId, userName) {
    document.querySelector('.chat-container').style.display = 'flex';
    initializeChat(userId, userName);
}



function displayMessage(message, currentUserId) {
    const chatBox = document.getElementById('chat-messages');
    const placeholder = chatBox.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();
    const messageDiv = document.createElement('div');
    const messageType = parseInt(message.sender_id, 10) === parseInt(currentUserId, 10) ? 'enviada' : 'recebida';
    messageDiv.className = `mensagem ${messageType}`;
    messageDiv.innerHTML = `<strong>${messageType === 'enviada' ? 'Você' : 'Outro'}:</strong> ${message.message_text}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


async function loadChatHistory(senderId, receiverId) {
    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML = '<p class="chat-placeholder">Carregando histórico...</p>'; 

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
        chatBox.innerHTML = ''; 

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
    

    document.querySelector('.chat-container').style.display = 'flex';

    socket.emit('joinChat', { senderId: myUserId, receiverId: otherUserId });
    
    loadChatHistory(myUserId, otherUserId); 

    updateServiceStatus(myUserId, myRole, otherUserId);
    
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



function setupEventListeners(token, userId) {
    document.getElementById('formEditarPerfil').addEventListener('submit', (e) => {
        e.preventDefault();
        updateUserProfile(token, userId);
    });
    

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
            const cep = cepInputEdit.value.replace(/\D/g, '');
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro) {
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
}
