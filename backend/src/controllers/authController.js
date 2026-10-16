const jwt = require('jsonwebtoken');
const storage = require('../utils/storage');

const USUARIOS_PADRAO = [
  {
    id: '1',
    nome: 'Aluno de Teste',
    email: 'aluno@teste.com',
    senha: '123456',
    perfil: 'Aluno'
  },
  {
    id: '2',
    nome: 'Professor de Teste',
    email: 'prof@teste.com',
    senha: '123456',
    perfil: 'Professor'
  }
];

// As contas ficam salvas em data/users.json
// (assim nao somem quando o servidor reinicia)
function carregarUsuarios() {
  const salvos = storage.read('users');

  if (salvos.length === 0) {
    storage.write('users', USUARIOS_PADRAO);
    return [...USUARIOS_PADRAO];
  }

  return salvos;
}

const users = carregarUsuarios();

const JWT_SECRET =
  process.env.JWT_SECRET || 'studyflow_secret_key_123';


// =====================================================
// LOGIN
// =====================================================

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'Preencha o e-mail e a senha.'
      });
    }

    const user = users.find(
      u =>
        u.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!user || user.senha !== senha) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos.'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        perfil: user.perfil
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);

    return res.status(500).json({
      error: 'Erro interno no servidor ao efetuar login.'
    });
  }
}


// =====================================================
// CADASTRO
// =====================================================

async function register(req, res) {
  try {
    const {
      nome,
      email,
      senha,
      perfil
    } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: 'Preencha todos os campos obrigatórios.'
      });
    }

    const emailNormalizado =
      email.trim().toLowerCase();

    const userExists = users.some(
      u =>
        u.email.toLowerCase() ===
        emailNormalizado
    );

    if (userExists) {
      return res.status(400).json({
        error: 'Este e-mail já está cadastrado.'
      });
    }

    const newUser = {
      id: String(
        users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1
      ),
      nome: nome.trim(),
      email: email.trim(),
      senha,
      perfil: perfil || 'Aluno'
    };

    users.push(newUser);
    storage.write('users', users);

    const token = jwt.sign(
      {
        userId: newUser.id,
        perfil: newUser.perfil
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        perfil: newUser.perfil
      }
    });

  } catch (err) {
    console.error('Erro no cadastro:', err);

    return res.status(500).json({
      error: 'Erro interno no servidor ao realizar cadastro.'
    });
  }
}


// =====================================================
// LISTAR ALUNOS
// =====================================================

async function listarAlunos(req, res) {
  try {
    const alunos = users
      .filter(user => user.perfil === 'Aluno')
      .map(user => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
      }));

    return res.json(alunos);

  } catch (err) {
    console.error('Erro ao listar alunos:', err);

    return res.status(500).json({
      error: 'Erro interno ao buscar alunos.'
    });
  }
}


// =====================================================
// LISTAR ALUNOS COM PROGRESSO
// =====================================================

async function listarAlunosComProgresso(req, res) {
  try {
    const planner = storage.read('planner');
    const resumos = storage.read('resumos');

    const alunos = users
      .filter(user => user.perfil === 'Aluno')
      .map(user => {

        const metasAluno = planner.filter(
          item =>
            String(item.userId) ===
            String(user.id)
        );

        const resumosAluno = resumos.filter(
          item =>
            String(item.userId) ===
            String(user.id)
        );

        const metasAlta = metasAluno.filter(
          item =>
            item.prioridade === 'alta'
        ).length;

        // XP inicial
        let xp = 50;

        // 3 ou mais metas
        if (metasAluno.length >= 3) {
          xp += 100;
        }

        // 3 ou mais resumos
        if (resumosAluno.length >= 3) {
          xp += 150;
        }

        // 5 ou mais atividades no total
        if (
          metasAluno.length +
          resumosAluno.length >= 5
        ) {
          xp += 200;
        }

        const nivel =
          Math.floor(xp / 100) + 1;

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,

          progresso: {
            totalMetas: metasAluno.length,
            metasAlta,
            totalResumos: resumosAluno.length,
            xp,
            nivel
          }
        };
      });

    return res.json(alunos);

  } catch (err) {
    console.error(
      'Erro ao listar progresso dos alunos:',
      err
    );

    return res.status(500).json({
      error:
        'Erro interno ao buscar progresso dos alunos.'
    });
  }
}


// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {
  login,
  register,
  listarAlunos,
  listarAlunosComProgresso
};