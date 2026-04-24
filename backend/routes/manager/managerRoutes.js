const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/manager/auth"); // JWT middleware
const { signupManager, updateProfile, forgotPassword, resetPassword } = require("../../controllers/manager/managerController");
const { checkRole } = require("../../middleware/manager/role");


// User authentication routes
router.post("/signup", signupManager);


// Profile update
router.put("/update-profile", verifyToken, updateProfile);


// Profile update
router.put("/forgot-password", verifyToken, forgotPassword);

// Password reset route
router.post("/reset-password", verifyToken, resetPassword);





module.exports = router;