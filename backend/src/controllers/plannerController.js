const storage = require('../utils/storage');

module.exports = {
  async index(req, res) {
    try {
      const plannerItems = storage.read('planner');
      return res.json(plannerItems.filter(item => item.userId === req.userId));
    } catch (err) {
      console.error('Erro ao buscar planner:', err);
      return res.status(500).json({ error: 'Erro ao buscar metas do planner.' });
    }
  },

  async store(req, res) {
    try {
      const { titulo, prioridade } = req.body;

      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ error: 'O título da meta é obrigatório.' });
      }

      const plannerItems = storage.read('planner');
      const novoItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: req.userId,
        titulo: titulo.trim(),
        prioridade: prioridade || 'media',
        criadoEm: new Date().toISOString()
      };

      plannerItems.push(novoItem);
      storage.write('planner', plannerItems);

      return res.status(201).json(novoItem);
    } catch (err) {
      console.error('Erro ao guardar planner:', err);
      return res.status(500).json({ error: 'Erro ao guardar meta no planner.' });
    }
  },

  async delete(req, res) {
    try {
      const plannerItems = storage.read('planner');
      const index = plannerItems.findIndex(
        item => item.id === req.params.id && item.userId === req.userId
      );

      if (index === -1) {
        return res.status(404).json({ error: 'Meta não encontrada.' });
      }

      plannerItems.splice(index, 1);
      storage.write('planner', plannerItems);

      return res.json({ message: 'Meta removida com sucesso.' });
    } catch (err) {
      console.error('Erro ao eliminar planner:', err);
      return res.status(500).json({ error: 'Erro ao eliminar meta.' });
    }
  }
};
