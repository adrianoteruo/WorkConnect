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

    fetchMyContacts(token);
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


async function fetchMyContacts(token) {
    const listElement = document.getElementById('contact-list'); // Usaremos uma div separada para a lista de contatos
    
    try {
        const response = await fetch(`${API_URL}/api/my-contacts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar seus contatos.');
        const contractors = await response.json();
        
        listElement.innerHTML = ''; // Limpa a lista
        if (contractors.length === 0) {
            listElement.innerHTML = '<p>Nenhum contratante entrou em contato com você ainda.</p>';
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
        document.getElementById('editServico').value = user.servico_oferecido || '';
        document.getElementById('editDescricao').value = user.descricao_servico || '';
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
    document.getElementById('chat-messages').innerHTML = '<p class="chat-placeholder">Carregando histórico...</p>';
    try {
        const response = await fetch(`/api/chat/${senderId}/${receiverId}`);
        const history = await response.json();
        document.getElementById('chat-messages').innerHTML = '';
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
    document.querySelector('.chat-container').style.display = 'flex'; // Mostra o chat

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

// Nova função para abrir o chat a partir da lista
function openChatWithUser(userId, userName) {
    mostrarSecao('mensagens');
    initializeChat(userId, userName);
}


// 4. CONFIGURAÇÃO DOS EVENT LISTENERS


function setupEventListeners(token, userId) {
    // Formulário de Edição
    document.getElementById('formEditarPerfil').addEventListener('submit', (e) => {
        e.preventDefault();
        updateUserProfile(token, userId);
    });

    // Preview da Foto
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
}
