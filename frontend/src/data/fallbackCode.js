export const FALLBACK_CODE = {
  frontend: `import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001' });
API.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title:'', priority:'medium', due_date:'' });
  const [filter, setFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    const q = filter !== 'all' ? '?status=' + filter : '';
    const { data } = await API.get('/tasks' + q);
    setTasks(data.tasks || []);
  }, [filter]);

  useEffect(() => { if (user) fetchTasks(); }, [user, fetchTasks]);

  const login = async () => {
    const { data } = await API.post('/auth/login', { email:'demo@app.com', password:'demo123' });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const submit = async (e) => {
    e.preventDefault();
    await API.post('/tasks', form);
    setForm({ title:'', priority:'medium', due_date:'' });
    await fetchTasks();
  };

  const patch = async (id, updates) => {
    await API.patch('/tasks/' + id, updates);
    await fetchTasks();
  };

  if (!user) return <div><button onClick={login}>Sign In</button></div>;

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:24}}>
      <h1>Tasks</h1>
      <form onSubmit={submit} style={{display:'flex',gap:8,marginBottom:20}}>
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title" required />
        <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
          {['low','medium','high','urgent'].map(p=><option key={p}>{p}</option>)}
        </select>
        <button type="submit">Add</button>
      </form>
      <ul>{tasks.map(t=>(
        <li key={t.id}>
          <span>{t.title}</span>
          <select value={t.status} onChange={e=>patch(t.id,{status:e.target.value})}>
            {['todo','in_progress','review','done'].map(s=><option key={s}>{s}</option>)}
          </select>
        </li>
      ))}</ul>
    </div>
  );
}`,
  backend: `const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
require('dotenv').config();

const app = express();
const db = new sqlite3.Database('./taskapp.db');

app.use(express.json());

const auth = (req, res, next) => {
  const tok = req.headers.authorization?.split(' ')[1];
  if (!tok) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(tok, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalid' }); }
};

app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 12, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    db.run('INSERT INTO users(email,password_hash,name) VALUES(?,?,?)',
      [email.toLowerCase(), hash, name],
      function(err) {
        if (err) return res.status(400).json({ error: 'Email already exists' });
        res.status(201).json({ user: { id: this.lastID, email, name }, token: jwt.sign({ id: this.lastID }, process.env.JWT_SECRET, { expiresIn: '7d' }) });
      });
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email=? AND deleted_at IS NULL', [email.toLowerCase()], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ user: { id: user.id, email: user.email }, token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }) });
    });
  });
});

app.get('/tasks', auth, (req, res) => {
  db.all('SELECT * FROM tasks WHERE creator_id=? AND deleted_at IS NULL ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ tasks: rows });
  });
});

app.post('/tasks', auth, (req, res) => {
  const { title, description, priority='medium', due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  db.run('INSERT INTO tasks(title,description,priority,due_date,creator_id) VALUES(?,?,?,?,?)',
    [title, description, priority, due_date, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.get('SELECT * FROM tasks WHERE id=?', [this.lastID], (err, row) => {
        res.status(201).json(row);
      });
    });
});

app.patch('/tasks/:id', auth, (req, res) => {
  const { status, title, priority } = req.body;
  const updates = [], params = [];
  if (status) { updates.push('status=?'); params.push(status); }
  if (title) { updates.push('title=?'); params.push(title); }
  if (priority) { updates.push('priority=?'); params.push(priority); }
  if (!updates.length) return res.status(400).json({ error: 'No updates' });
  updates.push('updated_at=datetime("now")');
  params.push(req.params.id, req.user.id);
  db.run('UPDATE tasks SET ' + updates.join(',') + ' WHERE id=? AND creator_id=?', params, function(err) {
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    db.get('SELECT * FROM tasks WHERE id=?', [req.params.id], (_, row) => res.json(row));
  });
});

app.delete('/tasks/:id', auth, (req, res) => {
  db.run('UPDATE tasks SET deleted_at=datetime("now") WHERE id=? AND creator_id=?', [req.params.id, req.user.id], function(err) {
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.listen(3001, () => console.log('API ready on :3001'));`,
  database: `-- SQLite Schema (Development)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  last_login TEXT,
  deleted_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
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
);

CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`,
  nginx: `worker_processes auto;
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  upstream backend { server backend:3001; }
  upstream frontend { server frontend:80; }
  server {
    listen 80;
    location /api/ { proxy_pass http://backend/; }
    location / { try_files $uri $uri/ /index.html; }
  }
}`,
  env: `# Environment Variables
NODE_ENV=development
PORT=3001
DATABASE_URL=./taskapp.db
JWT_SECRET=replace_with_64_byte_random_hex_string
REACT_APP_API_URL=http://localhost:3001`
};
