const express = require("express");
const router = express.Router();
const { loginUser } = require("../../controllers/client/authController");

// User login route
router.post("/signin", loginUser);

module.exports = router;