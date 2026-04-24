const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Manager = require("../../models/manager/Manager");




// Login for manager
exports.loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const manager = await Manager.findOne({ email });

    if (!manager) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (manager.is_deleted) {
      return res.status(403).json({ message: "Account is deleted" });
    }

    // ✅ Step 4: Check status
    if (manager.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // ✅ Step 5: Password check
    const isMatch = await bcrypt.compare(password, manager.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Step 6: Token generate
    const token = jwt.sign(
      {
        id: manager._id,
        email: manager.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        userId: manager.userId,
        name: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};