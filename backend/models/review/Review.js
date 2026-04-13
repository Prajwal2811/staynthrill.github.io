const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔥 relation
      required: true
    },
    title: String,
    rating: {
      type: String,
      enum: ["1/5", "2/5", "3/5", "4/5", "5/5"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    review: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);