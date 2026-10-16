const bcrypt = require('bcryptjs');

// Usuário padrão de teste já pré-cadastrado
const users = [
  {
    id: '1',
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    senha: bcrypt.hashSync('123', 10),
    perfil: 'Aluno'
  }
];

module.exports = {
  findByEmail: (email) => users.find(u => u.email === email),
  findById: (id) => users.find(u => u.id === id),
  create: (userData) => {
    const newUser = {
      id: String(users.length + 1),
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      perfil: userData.perfil || 'Aluno'
    };
    users.push(newUser);
    return newUser;
  }
};