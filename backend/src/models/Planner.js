const storage = require('../utils/storage');

module.exports = {
  findByUserId(userId) {
    return storage.read('planner').filter(item => item.userId === userId);
  },
  create(data) {
    const items = storage.read('planner');
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...data,
      criadoEm: new Date().toISOString()
    };
    items.push(item);
    storage.write('planner', items);
    return item;
  },
  delete(id, userId) {
    const items = storage.read('planner');
    const index = items.findIndex(item => item.id === id && item.userId === userId);
    if (index === -1) return null;
    const [removed] = items.splice(index, 1);
    storage.write('planner', items);
    return removed;
  }
};
