  import { login, register } from '../services/auth.js';
  

  export function initLoginView(onSuccess) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const authError = document.getElementById('auth-error');

    let isLoginMode = true;

    if (toggleAuthBtn) {
      toggleAuthBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        authError.textContent = '';
        if (isLoginMode) {
          authTitle.textContent = 'StudyFlow - Entrar na Conta';
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
          toggleAuthBtn.textContent = 'Não tem conta? Cadastre-se aqui';
        } else {
          authTitle.textContent = 'StudyFlow - Criar Conta';
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
          toggleAuthBtn.textContent = 'Já tem conta? Faça login';
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        const response = await login(email, senha);
        if (response.error) {
          authError.textContent = response.error;
        } else {
          onSuccess(response.user);
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const nome = document.getElementById('reg-nome').value;
        const email = document.getElementById('reg-email').value;
        const senha = document.getElementById('reg-senha').value;
        const perfil = document.getElementById('reg-perfil').value;

        const response = await register(nome, email, senha, perfil);
        if (response.error) {
          authError.textContent = response.error;
        } else {
          onSuccess(response.user);
        }
      });
    }
  }