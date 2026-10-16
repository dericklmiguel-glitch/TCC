const API_URL = 'http://localhost:3000';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { error: 'O servidor não retornou uma resposta válida.' };
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('A sua sessão expirou. Por favor, faça login novamente.');
      window.location.reload();
      return { error: 'Sessão expirada.' };
    }

    if (!response.ok) {
      return {
        error: data?.error || `Erro na API (${response.status}).`
      };
    }

    return data;
  } catch (error) {
    console.error('Erro na ligação com a API:', error);
    return { error: 'Não foi possível conectar ao servidor backend.' };
  }
}
