const bcrypt = require('bcrypt');
const { getDb } = require('../config/database');
const { issueToken } = require('../middleware/auth');

const register = (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  bcrypt.hash(password, 12, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    const db = getDb();
    db.run('INSERT INTO users(email,password_hash,name) VALUES(?,?,?)',
      [email.toLowerCase(), hash, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        const user = { id: this.lastID, email: email.toLowerCase(), name };
        res.status(201).json({ user, token: issueToken(user) });
      }
    );
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = getDb();
  db.get('SELECT * FROM users WHERE email=? AND deleted_at IS NULL', [email.toLowerCase()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      db.run('UPDATE users SET last_login=datetime("now") WHERE id=?', [user.id]);
      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token: issueToken(user)
      });
    });
  });
};

module.exports = { register, login };
