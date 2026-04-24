const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../../models/user/User");



// Login for clients
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Step 1: Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Step 2: Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // ✅ Step 3: Check deleted
    if (user.is_deleted) {
      return res.status(403).json({ message: "Account is deleted" });
    }

    // ✅ Step 4: Check status
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // ✅ Step 5: Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Step 6: Token generate
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Step 7: Response (same frontend-friendly format)
    res.json({
      message: "Login success",
      token,
      user: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
