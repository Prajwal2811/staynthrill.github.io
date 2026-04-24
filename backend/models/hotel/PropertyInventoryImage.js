const mongoose = require("mongoose");

const propertyInventoryImageSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },

  inventory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PropertyInventory",
    required: true,
  },

  image_url: {
    type: String,
    required: true,
  },

  is_primary: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });

module.exports = mongoose.model(
  "PropertyInventoryImage",
  propertyInventoryImageSchema,
  "staynthrill_property_inventory_images"
);