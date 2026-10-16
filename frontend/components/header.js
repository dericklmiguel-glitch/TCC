import { logout } from '../services/auth.js';

export function renderHeader(user) {
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  if (userNameSpan && user) {
    userNameSpan.textContent = user.nome;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}
// Exemplo dentro do componente header.js
function renderHeader() {
    return `
        <header class="app-header">
            <div class="logo-area">
                <img src="./logo.png" alt="Logo" class="header-logo" style="height: 40px;">
            </div>
            <!-- Outros elementos do header (usuário, botão de sair, etc) -->
        </header>
    `;
}