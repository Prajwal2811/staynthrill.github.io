const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Property = require("./models/hotel/Property");
const PropertyInventory = require("./models/hotel/PropertyInventory");
const PropertyInventoryImage = require("./models/hotel/PropertyInventoryImage");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Inventory Image Seeder)"))
  .catch((err) => console.error(err));

// 🎯 Dummy image pools
const imagePools = {
    room: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
        "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f9",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427"
    ],

    bed: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
        "https://images.unsplash.com/photo-1521783988139-893ce1a6fefb"
    ],

    unit: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
    ]
    };

// random helper
const randomNum = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seedInventoryImages = async () => {
  try {
    await PropertyInventoryImage.deleteMany();

    const inventories = await PropertyInventory.find();

    if (!inventories.length) {
      console.log("❌ No inventory found. Seed inventory first.");
      process.exit();
    }

    const images = [];

    inventories.forEach((inv) => {

      const pool = imagePools[inv.inventory_type] || imagePools.room;

      const count = randomNum(2, 5); // 🔥 2–5 images per inventory

      for (let i = 0; i < count; i++) {
        images.push({
          property_id: inv.property_id,
          inventory_id: inv._id,
          image_url: pool[i % pool.length],
          is_primary: i === 0 // first image primary
        });
      }
    });

    await PropertyInventoryImage.insertMany(images);

    console.log(`✅ ${images.length} Inventory Images Seeded`);
    process.exit();

  } catch (err) {
    console.error("❌ Error seeding inventory images:", err);
    process.exit(1);
  }
};

seedInventoryImages();