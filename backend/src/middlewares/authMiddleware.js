const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'studyflow_secret_key_123';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Sessão expirada ou token inválido.' });
    }
    req.userId = decoded.userId;
    req.userPerfil = decoded.perfil;
    return next();
  });
};