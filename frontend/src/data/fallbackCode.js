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
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

const auth = (req, res, next) => {
  const tok = req.headers.authorization?.split(' ')[1];
  if (!tok) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(tok, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalid' }); }
};

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await db.query(
    'INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id,email,name',
    [email.toLowerCase(), hash, name]
  );
  res.status(201).json({ user: rows[0], token: jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '15m' }) });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
  if (!rows[0] || !await bcrypt.compare(password, rows[0].password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user: { id: rows[0].id, email: rows[0].email }, token: jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '15m' }) });
});

app.get('/tasks', auth, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks WHERE creator_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC', [req.user.id]);
  res.json({ tasks: rows });
});

app.post('/tasks', auth, async (req, res) => {
  const { title, description, priority='medium', due_date } = req.body;
  const { rows } = await db.query(
    'INSERT INTO tasks(title,description,priority,due_date,creator_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [title, description, priority, due_date, req.user.id]
  );
  res.status(201).json(rows[0]);
});

app.patch('/tasks/:id', auth, async (req, res) => {
  const { status, title, priority } = req.body;
  const { rows } = await db.query(
    'UPDATE tasks SET status=COALESCE($1,status),title=COALESCE($2,title),priority=COALESCE($3,priority),updated_at=NOW() WHERE id=$4 AND creator_id=$5 AND deleted_at IS NULL RETURNING *',
    [status, title, priority, req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
  res.json(rows[0]);
});

app.delete('/tasks/:id', auth, async (req, res) => {
  await db.query('UPDATE tasks SET deleted_at=NOW() WHERE id=$1 AND creator_id=$2', [req.params.id, req.user.id]);
  res.status(204).send();
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(3001, () => console.log('API ready on :3001'));`,
  database: `-- PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE task_status AS ENUM ('todo','in_progress','review','done');
CREATE TYPE task_priority AS ENUM ('low','medium','high','urgent');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  creator_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_creator ON tasks(creator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;`,
  docker: `version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskapp
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [internal]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://appuser:\${POSTGRES_PASSWORD}@postgres:5432/taskapp
      JWT_SECRET: \${JWT_SECRET}
    depends_on: [postgres]
    networks: [internal]

  frontend:
    build: ./frontend
    depends_on: [backend]
    networks: [internal]

  nginx:
    image: nginx:1.25-alpine
    ports: ["80:80", "443:443"]
    depends_on: [frontend, backend]
    networks: [internal, external]

volumes: { pgdata: }
networks:
  internal: { driver: bridge, internal: true }
  external: { driver: bridge }`,
  env: `# Environment Variables
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://appuser:changeme@localhost:5432/taskapp
POSTGRES_DB=taskapp
POSTGRES_USER=appuser
POSTGRES_PASSWORD=changeme

JWT_SECRET=replace_with_64_byte_random_hex_string
JWT_EXPIRES_IN=15m

REACT_APP_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000`
};
