const storage = require('../utils/storage');

module.exports = {
  async index(req, res) {
    try {
      const eventos = storage.read('calendario');
      return res.json(eventos.filter(e => e.userId === req.userId));
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar anotações.' });
    }
  },

  async store(req, res) {
    try {
      const { data, titulo, cor } = req.body;

      if (!data || !titulo || !titulo.trim()) {
        return res.status(400).json({ error: 'Preencha a data e o título da anotação.' });
      }

      const eventos = storage.read('calendario');
      const novoEvento = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: req.userId,
        data,
        titulo: titulo.trim(),
        cor: cor || 'yellow',
        criadoEm: new Date().toISOString()
      };

      eventos.push(novoEvento);
      storage.write('calendario', eventos);

      return res.status(201).json(novoEvento);
    } catch (err) {
      console.error('Erro ao guardar anotação:', err);
      return res.status(500).json({ error: 'Erro ao guardar anotação no servidor.' });
    }
  },

  async delete(req, res) {
    try {
      const eventos = storage.read('calendario');
      const index = eventos.findIndex(
        e => e.id === req.params.id && e.userId === req.userId
      );

      if (index === -1) {
        return res.status(404).json({ error: 'Anotação não encontrada.' });
      }

      eventos.splice(index, 1);
      storage.write('calendario', eventos);

      return res.json({ message: 'Anotação eliminada com sucesso.' });
    } catch (err) {
      console.error('Erro ao eliminar anotação:', err);
      return res.status(500).json({ error: 'Erro ao eliminar anotação.' });
    }
  }
};
