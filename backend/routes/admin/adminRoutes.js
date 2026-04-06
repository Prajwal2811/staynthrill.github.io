const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/admin/auth"); // JWT middleware
const { getAdmins, toggleAdminStatus } = require("../../controllers/admin/adminController");
// ✅ Get all admins
router.get("/admins", verifyToken, getAdmins);

// ✅ Toggle status
router.patch("/admin/:id/status", verifyToken, toggleAdminStatus);
module.exports = router;