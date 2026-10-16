const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function filePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function read(name) {
  ensureDir();
  const file = filePath(name);

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf8');
    return [];
  }

  try {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Erro ao ler ${name}.json:`, error);
    return [];
  }
}

function write(name, data) {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { read, write };
