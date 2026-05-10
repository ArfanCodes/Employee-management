const jwt = require('jsonwebtoken');

/**
 * verifyToken middleware
 *
 * Reads the Authorization header, extracts the JWT, verifies it,
 * and attaches the decoded payload (id, email, role) to req.user.
 *
 * Why JWT?
 *  - Stateless: the server doesn't need to store session data.
 *  - Scalable: any server instance can verify the token using the shared secret.
 *  - Self-contained: user info is encoded inside the token.
 */
const verifyToken = (req, res, next) => {
  // Expected header format: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
