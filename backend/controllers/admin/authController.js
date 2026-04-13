const Admin = require("../../models/admin/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Step 1: Find by email only
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // ✅ Step 2: Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Step 3: Role check (secure way)
    if (user.role !== role) {
      return res.status(403).json({ message: "Unauthorized role access" });
    }

    // ✅ Step 4: Token
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Step 5: Send response in frontend-friendly format
    res.json({
      message: "Login success",
      token,                 // for API calls
      role: user.role,        // for ProtectedRoute
      adminUser: {            // for UserDropdown
        name: user.firstName,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};