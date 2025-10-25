document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    if (!token) { 
        window.location.href = '/';
        return;
    }
    
    document.getElementById('username').textContent = username;
    document.getElementById('user-role').textContent = userRole;

    const navigationArea = document.getElementById('navigation-area');
    let userPanelLink = '';

    if (userRole === 'Contratante') {
        userPanelLink = `<a href="/contratante" class="btn">Acessar Painel de Contratante</a>`;
    } else if (userRole === 'Profissional') {
        userPanelLink = `<a href="/profissional" class="btn">Acessar Painel de Profissional</a>`;
    } else {
        userPanelLink = `<p>Seu perfil de administrador não possui um painel específico.</p>`
    }

    navigationArea.innerHTML = userPanelLink;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
});
