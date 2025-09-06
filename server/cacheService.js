const Database = require('better-sqlite3');

const dbPath = process.env.CACHE_DB_PATH || './cache.db';
let db;

function init() {
  db = new Database(dbPath, { verbose: console.log });
  const createTable = `
    CREATE TABLE IF NOT EXISTS cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      provider TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(createTable);
  console.log('Cache database initialized.');
}

function get(prompt) {
  if (!db) {
    console.warn('Cache not initialized. Call init() first.');
    return null;
  }
  const stmt = db.prepare('SELECT response, provider FROM cache WHERE prompt = ? ORDER BY timestamp DESC LIMIT 1');
  const result = stmt.get(prompt);
  return result;
}

function set(prompt, response, provider) {
  if (!db) {
    console.warn('Cache not initialized. Call init() first.');
    return;
  }
  const stmt = db.prepare('INSERT INTO cache (prompt, response, provider) VALUES (?, ?, ?)');
  stmt.run(prompt, response, provider);
}

module.exports = {
  init,
  get,
  set,
};
