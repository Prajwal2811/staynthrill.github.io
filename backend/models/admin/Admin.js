// models/admin/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["super_admin","operations_admin","financial_admin","support_admin"], 
    required: true 
  },
  note: { type: String },

  // New fields
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  is_delete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema, "staynthrill_admins");