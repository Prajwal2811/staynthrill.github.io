const mongoose = require("mongoose");

const ManagerSchema = new mongoose.Schema(
  {
    managerId: {
      type: String,
      unique: true,
    },

    firstName: String,
    lastName: String,

    email: {
      type: String,
      unique: true,
    },

    phoneNumber: String,

    // ✅ Existing
    propertyType: {
      type: String,
      enum: ["single_property_owner", "multiple_property_owner"],
    },

    // ✅ NEW: Engine Types
    engineTypes: {
      type: [String],
      enum: ["room", "product"],
      default: [],
    },

    // ✅ NEW: Property Categories
    propertyCategories: {
      type: [String],
      default: [],
    },

    gstNumber: String,

    password: String,

    status: {
      type: String,
      default: "active",
    },

    is_delete: {
      type: Boolean,
      default: false,
    },

    review_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    admin_review_comment: {
      type: String,
      default: "",
    },

    // OTP / Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Manager", ManagerSchema, "staynthrill_managers");