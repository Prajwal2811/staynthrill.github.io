const Vendor = require("../../models/vendor/Vendor");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer"); // npm install nodemailer

// ✅ Get all vendors
exports.getVendors = async (req, res) => {
  try {
    // sirf non-deleted vendors fetch karo
    const vendors = await Vendor.find({ is_delete: false })
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Admin Status
exports.toggleVendorStatus = async (req, res) => {
  // console.log("PATCH request received for id:", req.params.id, "by user:", req.user.id);
  // console.log("PATCH called, params:", req.params);
  // console.log("req.user:", req.user);
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.status = vendor.status === "active" ? "inactive" : "active";
    await vendor.save();

    res.json({ status: vendor.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete a vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    await Vendor.findByIdAndDelete(vendorId);

    res.json({ message: "Vendor deleted successfully", id: vendorId });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.viewVendor = async (req, res) => {
  try {
    console.log("Vendor ID requested:", req.params.id); // check the ID
    const vendor = await Vendor.findById(req.params.id);
    console.log("Vendor fetched:", vendor); // check what comes from DB
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor); // send full vendor data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
