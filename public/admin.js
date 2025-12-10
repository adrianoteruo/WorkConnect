const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('userRole') !== 'Admin') {
        localStorage.clear();
        window.location.href = '/';
        return;
    }

    loadAllUsers(token);
    setupEventListeners(token);
});


async function loadAllUsers(token) {
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar usuários. Você tem permissão?');
        }
        
        const users = await response.json();
        tableBody.innerHTML = ''; 

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nome_completo}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn-delete-user" onclick="deleteUser(${user.id}, '${user.nome_completo}')">
                            <i class="fa-solid fa-trash"></i> Excluir
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" style="color: red;">${error.message}</td></tr>`;
    }
}


async function deleteUser(userId, userName) {
    const isConfirmed = confirm(`Você tem CERTEZA que deseja excluir o usuário "${userName}" (ID: ${userId})?\n\nEsta ação é irreversível.`);
    
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadAllUsers(token); 
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        alert(`Erro ao excluir usuário: ${error.message}`);
    }
}


function setupEventListeners(token) {
    const logoutButton = document.getElementById('logout-btn-sidebar');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }
}
