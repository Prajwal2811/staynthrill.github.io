// middleware/role.js
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied: role missing" });
    }

    const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }

    next();
  };
};