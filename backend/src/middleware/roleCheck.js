/**
 * requireRole — factory function that returns a role-guard middleware.
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, requireRole('admin'), handler)
 *
 * This runs AFTER verifyToken, so req.user is already populated.
 * Returns 403 Forbidden if the user's role doesn't match.
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: `Access denied. Requires '${role}' role.`
      });
    }

    next();
  };
};

module.exports = requireRole;
