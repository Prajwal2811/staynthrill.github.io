const express = require("express");
const router = express.Router();
const { loginManager } = require("../../controllers/manager/authController");

// User login route
router.post("/signin", loginManager);

module.exports = router;