const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    phoneNumber: String,
    password: String,
    businessName: String,
    gstNumber: String,
    address: String,
    role: { type: String, default: "vendor" },
    status: { type: String, default: "active" },
    is_delete: { type: Boolean, default: false },
    note: String,

    // ✅ Review status
    review_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ✅ Admin review comment
    admin_review_comment: {
      type: String,
      default: "", // default empty
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);