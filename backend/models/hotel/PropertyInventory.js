const mongoose = require("mongoose");

const propertyInventorySchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },

  inventory_type: {
    type: String,
    enum: ["room", "bed", "unit"],
    required: true,
  },

  property_name: String,
  description: String,

  price: Number,
  max_guests: Number,

  amenities: [String],

  bed_type: String,
  bed_room: Number,
  bath_room: Number,

}, { timestamps: true });

module.exports = mongoose.model("PropertyInventory", propertyInventorySchema, "staynthrill_property_inventory");