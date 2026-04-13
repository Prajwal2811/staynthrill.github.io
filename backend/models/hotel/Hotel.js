const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    address: String,

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true // 🔥 1 vendor = 1 hotel
    },

    vendorName: {
      type: String // optional (fast access ke liye)
    },

    rating: {
      type: Number,
      default: 0,
    },

    amenities: [String],

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);