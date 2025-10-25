const API_URL = 'http://localhost:3000';
const socket = io();
const myUserId = localStorage.getItem('userId');

socket.on('receiveMessage', (message) => {
    const chatSection = document.getElementById('mensagens');
    if (chatSection.classList.contains('ativa')) {
        displayMessage(message, myUserId);
    }
});


//  INICIALIZAÇÃO

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
            // Adicionamos data-attributes para guardar o ID e o NOME do profissional
            // Adicionamos a classe 'professional-card' para o event listener
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


function displayMessage(message, currentUserId) {
    const chatBox = document.getElementById('chat-messages');
    // Remove o placeholder se ele existir
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

    // Atualiza o título do chat
    document.getElementById('chat-with-name').textContent = `Conversando com ${otherUserName}`;

    socket.emit('joinChat', { senderId: myUserId, receiverId: otherUserId });
    loadChatHistory(myUserId, otherUserId);

    const sendButton = document.getElementById('send-message-btn');
    const messageInput = document.getElementById('chat-message-input');

    // Clona o botão para remover listeners antigos e evitar envios múltiplos
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);

    newSendButton.onclick = () => {
        const message = messageInput.value;
        if (message.trim()) {
            socket.emit('sendMessage', {
                senderId: myUserId,
                receiverId: otherUserId,
                message: message
            });
            messageInput.value = '';
        }
    };
}



function setupEventListeners(token, userId) {
   
    document.getElementById('formEditarPerfil').addEventListener('submit', (e) => { e.preventDefault(); updateUserProfile(token, userId); });
    document.getElementById('editFoto').addEventListener('change', (e) => { });
    const deleteButton = document.getElementById('btnExcluirPerfil');
    if (deleteButton) { deleteButton.addEventListener('click', () => deleteUserProfile(token, userId)); }


    //  LISTENER PARA OS CARDS DE PROFISSIONAIS
    const professionalsContainer = document.querySelector('#visaoGeral .cards');
    if (professionalsContainer) {
        professionalsContainer.addEventListener('click', (event) => {
            // Encontra o card principal que foi clicado
            const card = event.target.closest('.professional-card');
            
            if (card) {
                const professionalId = card.dataset.professionalId;
                const professionalName = card.dataset.professionalName;

                // Muda para a aba de mensagens
                mostrarSecao('mensagens');
                
                // Inicia o chat com o profissional selecionado
                initializeChat(professionalId, professionalName);
            }
        });
    }
}