const API_URL = 'http://localhost:3000';

async function authRequest(endpoint, body) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = {
        error: 'O servidor não retornou uma resposta válida.'
      };
    }

    if (!response.ok) {
      return {
        error: data?.error || 'Erro ao comunicar com o servidor.'
      };
    }

    return data;

  } catch (error) {
    console.error('Erro de autenticação:', error);

    return {
      error: 'Não foi possível conectar ao servidor backend.'
    };
  }
}


// ===============================
// LOGIN
// ===============================
export async function login(email, senha) {
  const response = await authRequest('/auth/login', {
    email: email.trim(),
    senha
  });

  if (response.error) {
    return response;
  }

  // Salva os dados da sessão
  if (response.token) {
    localStorage.setItem('token', response.token);
  }

  if (response.user) {
    localStorage.setItem(
      'user',
      JSON.stringify(response.user)
    );
  }

  return response;
}


// ===============================
// CADASTRO
// ===============================
export async function register(
  nome,
  email,
  senha,
  perfil
) {
  const response = await authRequest('/auth/register', {
    nome: nome.trim(),
    email: email.trim(),
    senha,
    perfil
  });

  if (response.error) {
    return response;
  }

  // Salva automaticamente a sessão após o cadastro
  if (response.token) {
    localStorage.setItem('token', response.token);
  }

  if (response.user) {
    localStorage.setItem(
      'user',
      JSON.stringify(response.user)
    );
  }

  return response;
}


// ===============================
// COMPATIBILIDADE
// ===============================
// Mantém essas funções caso algum
// outro arquivo do projeto use
// loginUser / registerUser.

export async function loginUser(email, senha) {
  return login(email, senha);
}

export async function registerUser({
  nome,
  email,
  senha,
  perfil
}) {
  return register(
    nome,
    email,
    senha,
    perfil
  );
}


// ===============================
// TOGGLE LOGIN / CADASTRO
// ===============================
export function setupAuthToggle() {
  const btnShowRegister =
    document.getElementById('btn-show-register');

  const btnShowLogin =
    document.getElementById('btn-show-login');

  const viewLogin =
    document.getElementById('view-login');

  const viewRegister =
    document.getElementById('view-register');

  if (btnShowRegister && btnShowLogin) {

    btnShowRegister.onclick = (e) => {
      e.preventDefault();

      if (viewLogin) {
        viewLogin.classList.add('hidden');
      }

      if (viewRegister) {
        viewRegister.classList.remove('hidden');
      }
    };

    btnShowLogin.onclick = (e) => {
      e.preventDefault();

      if (viewRegister) {
        viewRegister.classList.add('hidden');
      }

      if (viewLogin) {
        viewLogin.classList.remove('hidden');
      }
    };
  }
}