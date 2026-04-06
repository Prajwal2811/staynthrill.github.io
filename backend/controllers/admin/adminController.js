const Admin = require("../../models/admin/Admin");

// ✅ Get all admins
exports.getAdmins = async (req, res) => {
  try {
    // role 'super_admin' nahi hone wale admins fetch karo
    const admins = await Admin.find({ role: { $ne: "super_admin" } }).sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Admin Status
exports.toggleAdminStatus = async (req, res) => {
  try {
    // req.user.id comes from your verifyToken middleware
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.status = admin.status === "active" ? "inactive" : "active";
    await admin.save();

    res.json({ status: admin.status });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};