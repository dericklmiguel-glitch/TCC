const resumos = [];

module.exports = {
  findByUserId: (userId) => resumos.filter(r => r.userId === userId),
  create: (data) => {
    const newResumo = {
      id: String(resumos.length + 1),
      userId: data.userId,
      disciplina: data.disciplina,
      titulo: data.titulo,
      conteudo: data.conteudo,
      dataCriacao: new Date()
    };
    resumos.push(newResumo);
    return newResumo;
  },
  delete: (id, userId) => {
    const index = resumos.findIndex(r => r.id === id && r.userId === userId);
    if (index !== -1) {
      return resumos.splice(index, 1)[0];
    }
    return null;
  }
};