const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const resumosRoutes = require('./routes/resumosRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');

const app = express();

// Middlewares obrigatórios
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/auth', authRoutes);
app.use('/planner', plannerRoutes);
app.use('/resumos', resumosRoutes);
app.use('/calendario', calendarioRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nERRO: a porta ${PORT} já está sendo usada por outro programa.\n` +
        `Feche o outro servidor (ou outro terminal com npm start) e tente de novo.\n`
      );
    } else {
      console.error('Erro ao iniciar o servidor:', err);
    }
    process.exit(1);
  }

  console.log(`Servidor rodando na porta ${PORT}`);
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
  process.exit(1);
});