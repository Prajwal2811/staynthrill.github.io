// middleware/auth.js
const jwt = require("jsonwebtoken");


exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure required fields exist in token
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Normalize role to lowercase to avoid mismatch
    decoded.role = decoded.role.toLowerCase();

    req.user = decoded; // { id, role, name?, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};