const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // 🔥 important
    trim: true
  },

  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  country: String,
  state: String,
  city: String,
  street: String,
  pincode: String,

  property_category: {
    type: String,
    enum: [
      "hotel", "resort", "hostel", "capsule",
      "villa", "farmhouse", "apartment", "cottage"
    ],
  },

  engine_type: {
    type: String,
    enum: ["room", "product"],
  }

}, { timestamps: true });

module.exports = mongoose.model("Property", PropertySchema, "staynthrill_properties");