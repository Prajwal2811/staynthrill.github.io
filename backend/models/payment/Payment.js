const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  paymentId: {
    type: String,
    unique: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  serviceType: {
    type: String,
    enum: ["Hotel Stay", "Adventure Trip"],
    required: true
  },

  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },

  adventure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Adventure"
  },

  amount: Number,

  status: {
    type: String,
    enum: ["paid", "pending", "failed"]
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Auto Payment ID
paymentSchema.pre("save", function (next) {
  if (!this.paymentId) {
    this.paymentId = "PAY-" + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);