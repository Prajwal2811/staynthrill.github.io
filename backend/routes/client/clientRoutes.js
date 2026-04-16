const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/client/auth"); // JWT middleware
const { loginUser, signupUser, updateProfile, forgotPassword, resetPassword } = require("../../controllers/client/clientController");
const { checkRole } = require("../../middleware/client/role");


// User authentication routes
router.post("/signup", signupUser);

// User login route
router.post("/signin", loginUser);

// Profile update
router.put("/update-profile", verifyToken, updateProfile);


// Profile update
router.put("/forgot-password", verifyToken, forgotPassword);

// Password reset route
router.post("/reset-password", verifyToken, resetPassword);





module.exports = router;