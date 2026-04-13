const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true, // 🔥 direct vendor relation (fast queries)
    },

    category: {
      type: String,
      enum: ["Standard", "Deluxe", "Super Deluxe", "Suite"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    totalRooms: {
      type: Number,
      required: true,
    },

    maxGuests: {
      type: Number,
      default: 2,
    },

    amenities: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);