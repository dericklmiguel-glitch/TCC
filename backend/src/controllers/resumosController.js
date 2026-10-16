const storage = require('../utils/storage');

module.exports = {
  async index(req, res) {
    try {
      const resumos = storage.read('resumos');
      return res.json(resumos.filter(r => r.userId === req.userId));
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar resumos.' });
    }
  },

  async store(req, res) {
    try {
      const { disciplina, titulo, conteudo } = req.body;

      if (!disciplina || !titulo || !conteudo) {
        return res.status(400).json({ error: 'Preencha todos os campos do resumo.' });
      }

      const resumos = storage.read('resumos');
      const novoResumo = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: req.userId,
        disciplina: disciplina.trim(),
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        dataCriacao: new Date().toISOString()
      };

      resumos.push(novoResumo);
      storage.write('resumos', resumos);

      return res.status(201).json(novoResumo);
    } catch (err) {
      console.error('Erro ao salvar resumo:', err);
      return res.status(500).json({ error: 'Erro ao salvar resumo.' });
    }
  },

  async delete(req, res) {
    try {
      const resumos = storage.read('resumos');
      const index = resumos.findIndex(
        r => r.id === req.params.id && r.userId === req.userId
      );

      if (index === -1) {
        return res.status(404).json({ error: 'Resumo não encontrado.' });
      }

      resumos.splice(index, 1);
      storage.write('resumos', resumos);

      return res.json({ message: 'Resumo excluído com sucesso.' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao excluir resumo.' });
    }
  }
};
