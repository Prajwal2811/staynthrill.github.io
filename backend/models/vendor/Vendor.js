const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      required: true,
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

    businessName: {
      type: String,
      required: true,
    },

    gstNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: ["hotel_vendor", "adventure_vendor"],
      required: true,
    },

    // 🔥 RELATION FIELD (Manager)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },

    // ✅ ADD THESE (IMPORTANT FOR YOUR LOGIC)

    propertyType: {
      type: String,
      enum: ["single_property_owner", "multiple_property_owner"],
      required: true,
    },

    engineTypes: [
      {
        type: String,
        enum: ["room", "product"],
      },
    ],

    propertyCategories: [
      {
        type: String,
        enum: [
          "Hotel",
          "Resort",
          "Hostel/Dorm",
          "Capsule",
          "Villa",
          "Farmhouse",
          "Apartment",
          "Cottage",
        ],
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    is_delete: {
      type: Boolean,
      default: false,
    },

    note: {
      type: String,
      default: "",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vendor", vendorSchema, "staynthrill_vendors");