const express = require("express");
const router = express.Router();
const { login } = require("../controllers/Admin/authController");

router.post("/login", login);

module.exports = router;