async function updateServiceStatus(myId, myRole, otherUserId) {
    const statusBox = document.getElementById('service-status-box');
    if (!statusBox) return;

    const token = localStorage.getItem('token'); 
    if (!token) {
        statusBox.innerHTML = `<p style="color: red;">Sessão expirada.</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/services/chat-status/${otherUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error('Falha ao buscar status do serviço.');
        
        const service = await response.json();
        
        renderServiceUI(statusBox, service, token, myRole, otherUserId);

    } catch (error) {
        console.error("Erro ao atualizar status do serviço:", error);
        statusBox.innerHTML = `<p style="color: red;">Erro ao carregar status do serviço.</p>`;
    }
}

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


async function proposeService(token, profissionalId) {
    const confirm = await Swal.fire({
        title: 'Propor Serviço?',
        text: "Isso enviará uma proposta formal para o profissional.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, propor!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_URL}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ profissionalId })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        const myUserId = localStorage.getItem('userId');
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId: profissionalId });

        Swal.fire('Enviado!', result.message, 'success');

    } catch (error) {
        Swal.fire('Erro', error.message, 'error');
    }
}

async function approveService(token, serviceId) {
    const confirm = await Swal.fire({
        title: 'Aceitar Serviço?',
        text: "Ao aceitar, o serviço entrará em status 'Ativo'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, aceitar trabalho!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/approve`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId; 
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

        Swal.fire('Aceito!', 'O serviço agora está ativo.', 'success');

    } catch (error) {
        Swal.fire('Erro', error.message, 'error');
    }
}


async function requestCompletion(token, serviceId) {
    const confirm = await Swal.fire({
        title: 'Solicitar Conclusão?',
        text: "Você está indicando que o trabalho foi finalizado.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, solicitar!',
        cancelButtonText: 'Voltar'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/request-complete`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId;
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

        Swal.fire('Solicitado!', 'Aguardando confirmação da outra parte.', 'success');

    } catch (error) {
        Swal.fire('Erro', error.message, 'error');
    }
}


async function confirmCompletion(token, serviceId) {
    const confirm = await Swal.fire({
        title: 'Finalizar Serviço?',
        text: "Isso encerrará o ciclo de serviço definitivamente e liberará a avaliação.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, finalizar!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_URL}/api/services/${serviceId}/confirm-complete`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        const myUserId = localStorage.getItem('userId');
        const otherUserId = currentChatPartnerId;
        socket.emit('serviceStatusChanged', { senderId: myUserId, otherUserId });

        Swal.fire('Concluído!', 'Serviço finalizado com sucesso.', 'success');

    } catch (error) {
        Swal.fire('Erro', error.message, 'error');
    }
}


async function rateCompletedService(token, serviceId, evaluatedId) {
    const evaluatedName = document.getElementById('chat-with-name').textContent.replace('Conversando com ', '');

    const { value: formValues } = await Swal.fire({
        title: `Avaliar ${evaluatedName}`,
        html: `
            <div style="text-align: left; margin-bottom: 10px;">
                <label>Nota (1 a 5):</label>
                <select id="swal-rating" class="swal2-input" style="margin-top: 5px;">
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Muito Bom)</option>
                    <option value="3">⭐⭐⭐ (3 - Bom)</option>
                    <option value="2">⭐⭐ (2 - Ruim)</option>
                    <option value="1">⭐ (1 - Péssimo)</option>
                </select>
            </div>
            <div style="text-align: left;">
                <label>Comentário (Opcional):</label>
                <textarea id="swal-comment" class="swal2-textarea" placeholder="Escreva como foi o serviço..." style="margin-top: 5px;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar Avaliação',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                rating: document.getElementById('swal-rating').value,
                comment: document.getElementById('swal-comment').value
            }
        }
    });

    if (!formValues) return;

    try {
        const response = await fetch(`${API_URL}/api/evaluations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                evaluated_id: evaluatedId, 
                rating: parseInt(formValues.rating), 
                comment: formValues.comment 
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: result.message,
            confirmButtonColor: '#3085d6',
        });

    } catch (error) {

        Swal.fire({
            icon: 'error',
            title: 'Atenção',
            text: error.message,
            confirmButtonColor: '#d33',
        });
    }
}
