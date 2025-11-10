// Pega o token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const resetForm = document.getElementById('reset-form');
const newPasswordEl = document.getElementById('new-password');
const confirmPasswordEl = document.getElementById('confirm-password');
const messageEl = document.getElementById('message');

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    
    const newPassword = newPasswordEl.value;
    const confirmPassword = confirmPasswordEl.value;

    if (newPassword !== confirmPassword) {
        messageEl.textContent = 'As senhas não conferem.';
        messageEl.style.color = 'red';
        return;
    }
    
    if (!token) {
        messageEl.textContent = 'Token não encontrado. O link é inválido.';
        messageEl.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageEl.textContent = data.message;
            messageEl.style.color = 'green';
            resetForm.style.display = 'none'; 
            
            // Redireciona para o login 
            setTimeout(() => {
                window.location.href = '/'; 
            }, 3000);
        
        } else {
            // Se o token for inválido ou expirado
            messageEl.textContent = data.message;
            messageEl.style.color = 'red';
        }
    
    } catch (error) {
        messageEl.textContent = 'Erro ao conectar com o servidor.';
        messageEl.style.color = 'red';
    }
});