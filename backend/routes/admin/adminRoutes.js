const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/admin/auth"); // JWT middleware
const { getAdmins, toggleAdminStatus , deleteAdmin, editAdmin, updateAdmin, createAdmin } = require("../../controllers/admin/adminController");


// ✅ Get all admins
router.get("/admins", verifyToken, getAdmins);

// Toggle admin status
router.patch("/:id/status", verifyToken, toggleAdminStatus);

// Delete admin
router.delete("/:id", verifyToken, deleteAdmin);

// Fetch single admin for edit
router.get("/:id/edit", verifyToken, editAdmin);

// Update admin
router.put("/:id", verifyToken, updateAdmin); // your update controller

// Create new admin
router.post("/", verifyToken, createAdmin);


module.exports = router;