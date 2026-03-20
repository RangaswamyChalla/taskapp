const { getDb } = require('../config/database');

const getTasks = (req, res) => {
  const { status, priority, assignee_id } = req.query;
  let sql = 'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id WHERE t.creator_id=? AND t.deleted_at IS NULL';
  const params = [req.user.id];

  if (status) { params.push(status); sql += ` AND t.status=?`; }
  if (priority) { params.push(priority); sql += ` AND t.priority=?`; }
  if (assignee_id) { params.push(assignee_id); sql += ` AND t.assignee_id=?`; }

  sql += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';

  const db = getDb();
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ tasks: rows, total: rows.length });
  });
};

const createTask = (req, res) => {
  const { title, description, priority = 'medium', due_date, assignee_id } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

  const db = getDb();
  db.run(
    'INSERT INTO tasks(title,description,priority,due_date,creator_id,assignee_id) VALUES(?,?,?,?,?,?)',
    [title.trim(), description || null, priority, due_date || null, req.user.id, assignee_id || null],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.get('SELECT * FROM tasks WHERE id=?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json(row);
      });
    }
  );
};

const updateTask = (req, res) => {
  const { status, title, priority, assignee_id, description } = req.body;
  const updates = [];
  const params = [];

  if (status !== undefined) { updates.push('status=?'); params.push(status); }
  if (title !== undefined) { updates.push('title=?'); params.push(title); }
  if (priority !== undefined) { updates.push('priority=?'); params.push(priority); }
  if (assignee_id !== undefined) { updates.push('assignee_id=?'); params.push(assignee_id); }
  if (description !== undefined) { updates.push('description=?'); params.push(description); }

  if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });

  updates.push('updated_at=datetime("now")');
  params.push(req.params.id, req.user.id);

  const db = getDb();
  db.run(
    `UPDATE tasks SET ${updates.join(',')} WHERE id=? AND creator_id=? AND deleted_at IS NULL`,
    params,
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
      db.get('SELECT * FROM tasks WHERE id=?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row);
      });
    }
  );
};

const deleteTask = (req, res) => {
  const db = getDb();
  db.run(
    'UPDATE tasks SET deleted_at=datetime("now") WHERE id=? AND creator_id=?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
      res.status(204).send();
    }
  );
};

const getStats = (req, res) => {
  const db = getDb();
  db.all(
    'SELECT status, priority, COUNT(*) as count FROM tasks WHERE creator_id=? AND deleted_at IS NULL GROUP BY status, priority',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ stats: rows });
    }
  );
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getStats };
