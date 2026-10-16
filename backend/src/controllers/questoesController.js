const bancoQuestoes = [
  {
    id: '1',
    disciplina: 'Matemática',
    enunciado: 'Quanto é 2 + 2?',
    opcoes: ['3', '4', '5'],
    respostaCorreta: 1
  }
];

module.exports = {
  async index(req, res) {
    try {
      return res.json(bancoQuestoes);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao procurar questões.' });
    }
  },

  async store(req, res) {
    try {
      const { disciplina, enunciado, opcoes, respostaCorreta } = req.body;

      if (!disciplina || !enunciado || !opcoes || respostaCorreta === undefined) {
        return res.status(400).json({ error: 'Preencha todos os campos da questão.' });
      }

      const novaQuestao = {
        id: String(bancoQuestoes.length + 1),
        disciplina,
        enunciado,
        opcoes,
        respostaCorreta: Number(respostaCorreta)
      };

      bancoQuestoes.push(novaQuestao);
      return res.status(201).json(novaQuestao);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao guardar questão.' });
    }
  }
};