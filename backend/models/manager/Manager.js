const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
  {
    managerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔥 PROPERTY TYPE
    propertyType: {
      type: String,
      enum: ["single_property_owner", "multiple_property_owner"],
      required: true,
    },

    // 🔥 GST NUMBER
    gstNumber: {
      type: String,
      trim: true,
    },

    // 🔥 REVIEW STATUS (ADMIN CONTROL)
    review_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔥 ADMIN COMMENT
    admin_review_comment: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    is_delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Manager", managerSchema);