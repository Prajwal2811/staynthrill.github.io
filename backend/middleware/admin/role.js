// middleware/role.js

/**
 * Role-based access control middleware
 * Usage: checkRole("admin", "manager")
 */
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied: role missing" });
    }

    // Normalize allowed roles to lowercase
    const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }

    next();
  };
};