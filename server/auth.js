// server/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
module.exports = authMiddleware;

// Usage in routes (server/index.js):
// const authMiddleware = require('./auth');
// app.get('/api/dashboard', authMiddleware, (req, res) => { ... });
