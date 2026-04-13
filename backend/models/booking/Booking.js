const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },

    // 🔗 Relation with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },

    customerName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    service: {
      type: String,
      enum: ["Hotel Stay", "Adventure Trip"],
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);