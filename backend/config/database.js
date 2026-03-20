const sqlite3 = require('sqlite3').verbose();

const getDb = () => new sqlite3.Database('./taskapp.db');

const initSchema = (db) => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      last_login TEXT,
      deleted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      creator_id INTEGER NOT NULL,
      assignee_id INTEGER,
      deleted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_id) REFERENCES users(id)
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
  });
};

const initDb = () => {
  const db = getDb();
  initSchema(db);
  return db;
};

module.exports = { getDb, initDb };
