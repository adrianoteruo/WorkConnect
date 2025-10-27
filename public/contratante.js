const API_URL = 'http://localhost:3000';
const socket = io();
const myUserId = localStorage.getItem('userId');

// Ouve por novas mensagens que chegam do servidor
socket.on('receiveMessage', (message) => {
    const chatSection = document.getElementById('mensagens');
    if (chatSection.classList.contains('ativa')) {
        displayMessage(message, myUserId);
    }
});


// 1. INICIALIZAÇÃO

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token || !myUserId) {
        window.location.href = '/';
        return;
    }

    fetchAllProfessionals(token);
    loadUserProfileForEditing(token, myUserId);
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


async function fetchAllProfessionals(token) {
    const container = document.querySelector('#visaoGeral .cards');
    try {
        const response = await fetch(`${API_URL}/api/professionals`, {
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

// ✅ FUNÇÃO RE-ADICIONADA
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

// ✅ FUNÇÃO RE-ADICIONADA
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

// ✅ FUNÇÃO RE-ADICIONADA
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

// --- FUNÇÕES DO CHAT ---
function displayMessage(message, currentUserId) {
    const chatBox = document.getElementById('chat-messages');
    const placeholder = chatBox.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();
    const messageDiv = document.createElement('div');
    const messageType = message.sender_id == currentUserId ? 'enviada' : 'recebida';
    messageDiv.className = `mensagem ${messageType}`;
    messageDiv.innerHTML = `<strong>${messageType === 'enviada' ? 'Você' : 'Outro'}:</strong> ${message.message_text}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadChatHistory(senderId, receiverId) {
    document.getElementById('chat-messages').innerHTML = '';
    try {
        const response = await fetch(`/api/chat/${senderId}/${receiverId}`);
        const history = await response.json();
        if (history.length === 0) {
            document.getElementById('chat-messages').innerHTML = '<p class="chat-placeholder">Ainda não há mensagens. Envie a primeira!</p>';
        } else {
            history.forEach(message => displayMessage(message, senderId));
        }
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

function initializeChat(otherUserId, otherUserName) {
    if (!myUserId || !otherUserId) return;
    document.getElementById('chat-with-name').textContent = `Conversando com ${otherUserName}`;
    socket.emit('joinChat', { senderId: myUserId, receiverId: otherUserId });
    loadChatHistory(myUserId, otherUserId);
    const sendButton = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('chat-message-input');
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    newSendButton.onclick = () => {
        const message = messageInput.value;
        if (message.trim()) {
            socket.emit('sendMessage', { senderId: myUserId, receiverId: otherUserId, message: message });
            messageInput.value = '';
        }
    };
}

// 4. CONFIGURAÇÃO DOS EVENT LISTENERS

function setupEventListeners(token, userId) {
    // Formulário de Edição
    document.getElementById('formEditarPerfil').addEventListener('submit', (e) => {
        e.preventDefault();
        updateUserProfile(token, userId);
    });

    // ✅ LÓGICA DO PREVIEW DA FOTO CORRIGIDA
    document.getElementById('editFoto').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('previewFoto').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Botão de Excluir
    const deleteButton = document.getElementById('btnExcluirPerfil');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteUserProfile(token, userId);
        });
    }

    // Cards de Profissionais (para iniciar o chat)
    const professionalsContainer = document.querySelector('#visaoGeral .cards');
    if (professionalsContainer) {
        professionalsContainer.addEventListener('click', (event) => {
            const card = event.target.closest('.professional-card');
            if (card) {
                const professionalId = card.dataset.professionalId;
                const professionalName = card.dataset.professionalName;
                mostrarSecao('mensagens');
                initializeChat(professionalId, professionalName);
            }
        });
    }
}
