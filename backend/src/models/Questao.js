const questoes = [
  {
    id: '1',
    disciplina: 'Matemática',
    enunciado: 'Qual é o resultado de 2x + 5 = 15?',
    opcoes: ['x = 3', 'x = 5', 'x = 10'],
    respostaCorreta: 1
  },
  {
    id: '2',
    disciplina: 'História',
    enunciado: 'Em que ano começou a Segunda Guerra Mundial?',
    opcoes: ['1914', '1939', '1945'],
    respostaCorreta: 1
  }
];

module.exports = {
  findAll: () => questoes,
  create: (data) => {
    const newQuestao = {
      id: String(questoes.length + 1),
      disciplina: data.disciplina,
      enunciado: data.enunciado,
      opcoes: data.opcoes,
      respostaCorreta: Number(data.respostaCorreta)
    };
    questoes.push(newQuestao);
    return newQuestao;
  }
};