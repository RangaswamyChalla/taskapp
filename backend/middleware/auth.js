const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const tok = req.headers.authorization?.split(' ')[1];
  if (!tok) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(tok, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};

const issueToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports = { auth, issueToken };
