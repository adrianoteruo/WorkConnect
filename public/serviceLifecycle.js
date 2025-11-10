// Esta função principal busca o status e atualiza a UI
async function updateServiceStatus(myId, myRole, otherUserId) {
    const statusBox = document.getElementById('service-status-box');
    if (!statusBox) return;

    const token = localStorage.getItem('token'); 
    if (!token) {
        statusBox.innerHTML = `<p style="color: red;">Sessão expirada.</p>`;
        return;
    }

    //  Busca o status atual na API
    try {
        const response = await fetch(`${API_URL}/api/services/chat-status/${otherUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error('Falha ao buscar status do serviço.');
        
        const service = await response.json();
        
        //  Renderiza a UI correta baseado no status
        renderServiceUI(statusBox, service, token, myRole, otherUserId);

    } catch (error) {
        console.error("Erro ao atualizar status do serviço:", error);
        statusBox.innerHTML = `<p style="color: red;">Erro ao carregar status do serviço.</p>`;
    }
}

// Esta função decide qual HTML/botão mostrar
function renderServiceUI(statusBox, service, token, myRole, otherUserId) {
    const serviceId = service.id;
    const myId = localStorage.getItem('userId'); 

    switch (service.status) {
        case 'none': 
            if (myRole === 'Contratante') {
                statusBox.innerHTML = `
                    <p>Nenhum serviço ativo.</p>
                    <button onclick="proposeService('${token}', '${otherUserId}')">Propor Novo Serviço</button>
                `;
            } else {
                statusBox.innerHTML = `<p>Aguardando proposta do contratante.</p>`;
            }
            break;

        case 'pending':
            if (myRole === 'Contratante') {
                statusBox.innerHTML = `<p><strong>Proposta enviada.</strong> Aguardando aprovação do profissional.</p>`;
            } else {
                statusBox.innerHTML = `
                    <p><strong>Nova proposta de serviço!</strong></p>
                    <button class="btn-approve" onclick="approveService('${token}', ${serviceId})">Aceitar Serviço</button>
                `;
            }
            break;

        case 'active':
            statusBox.innerHTML = `
                <p><strong>Serviço em andamento.</strong></p>
                <button class="btn-complete" onclick="requestCompletion('${token}', ${serviceId})">Solicitar Conclusão</button>
            `;
            break;


        case 'completion_requested':
            if (service.requested_by_id == myId) {
                statusBox.innerHTML = `<p><strong>Solicitação de conclusão enviada.</strong> Aguardando confirmação da outra parte.</p>`;
            } else {
                statusBox.innerHTML = `
                    <p><strong>A outra parte solicitou a conclusão do serviço.</strong></p>
                    <button class="btn-approve" onclick="confirmCompletion('${token}', ${serviceId})">Confirmar Conclusão</button>
                `;
            }
            break;

        case 'completed':
            statusBox.innerHTML = `
                <p><strong>Serviço Concluído.</strong> Obrigado!</p>
                <button onclick="rateCompletedService('${token}', ${serviceId}, ${otherUserId})">Avaliar Usuário</button>
            `;
            break;
        
        case 'cancelled':
            statusBox.innerHTML = `<p>Este serviço foi cancelado.</p>`;
            break;

        default:
            statusBox.innerHTML = `<p>Status de serviço desconhecido.</p>`;
    }
}


//  Contratante propõe
async function proposeService(token, profissionalId) {
    try {
        const response = await fetch(`${API_URL}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ profissionalId })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        alert(result.message);
        // Dispara o evento de atualização 
        const myUserId = localStorage.getItem('userId');
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId: profissionalId });

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

//  Profissional aprova
async function approveService(token, serviceId) {
    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/approve`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        alert(result.message);
        // Dispara o evento de atualização 
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId; // Pega da variável global do chat
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

//  Qualquer um solicita conclusão
async function requestCompletion(token, serviceId) {
    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/request-complete`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        alert(result.message);
        // Dispara o evento de atualização 
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId;
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

//  O outro confirma a conclusão
async function confirmCompletion(token, serviceId) {
    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/confirm-complete`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        alert(result.message);
        // Dispara o evento de atualização 
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId;
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

//  Botão "Avaliar" 
async function rateCompletedService(token, serviceId, evaluatedId) {
   
    const evaluatedName = document.getElementById('chat-with-name').textContent.replace('Conversando com ', '');
    
    const rating = prompt(`Serviço concluído! Qual nota (de 1 a 5) você dá para ${evaluatedName}?`);
    if (!rating) return; 

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        alert("Nota inválida. Por favor, insira um número de 1 a 5.");
        return;
    }
    const comment = prompt("Deixe um comentário (opcional):");

    try {
        const response = await fetch(`${API_URL}/api/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ evaluated_id: evaluatedId, rating: numRating, comment: comment })
        });

        const result = await response.json();
        alert(result.message); 

        if (!response.ok) throw new Error(result.message);

    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        alert(`Erro ao enviar avaliação: ${error.message}`);
    }
}