const mongoose = require("mongoose");

const adventureSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  duration: {
    type: String // e.g. "2 hours", "1 day"
  },

  difficultyLevel: {
    type: String,
    enum: ["Easy", "Moderate", "Hard"]
  },

  maxParticipants: {
    type: Number
  },

  availableSlots: [
    {
      date: Date,
      time: String, // Morning / Afternoon / Evening
      availableSeats: Number
    }
  ],

  includedServices: [
    {
      type: String // e.g. "Guide", "Equipment", "Insurance"
    }
  ],

  images: [
    {
      type: String // image URLs
    }
  ],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Adventure", adventureSchema, "staynthrill_adventures");