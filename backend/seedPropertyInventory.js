const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Property = require("./models/hotel/Property");
const PropertyInventory = require("./models/hotel/PropertyInventory");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Inventory Seeder)"))
  .catch((err) => console.error(err));

const seedInventory = async () => {
  try {
    await PropertyInventory.deleteMany();

    const properties = await Property.find();

    if (!properties.length) {
      console.log("❌ No properties found. Seed properties first.");
      process.exit();
    }

    const inventories = [];

    properties.forEach((property) => {

      // 🔥 Category-based logic
      switch (property.property_category) {

        case "hotel":
        case "resort":
          inventories.push(
            {
              property_id: property._id,
              inventory_type: "room",
              name: "Deluxe Room",
              description: "Spacious deluxe room",
              price: 3000,
              max_guests: 2,
              amenities: ["AC", "WiFi", "TV"],
              bed_type: "Queen",
              bed_room: 1,
              bath_room: 1,
            },
            {
              property_id: property._id,
              inventory_type: "room",
              name: "Suite Room",
              description: "Luxury suite",
              price: 6000,
              max_guests: 4,
              amenities: ["AC", "WiFi", "TV", "Mini Bar"],
              bed_type: "King",
              bed_room: 2,
              bath_room: 2,
            }
          );
          break;

        case "hostel":
          inventories.push(
            {
              property_id: property._id,
              inventory_type: "bed",
              name: "Dorm Bed",
              description: "Shared dormitory bed",
              price: 500,
              max_guests: 1,
              amenities: ["WiFi", "Locker"],
              bed_type: "Bunk",
              bed_room: 1,
              bath_room: 1,
            }
          );
          break;

        case "capsule":
          inventories.push({
            property_id: property._id,
            inventory_type: "bed",
            name: "Capsule Pod",
            description: "Compact sleeping pod",
            price: 800,
            max_guests: 1,
            amenities: ["WiFi", "Charging Point"],
            bed_type: "Single",
            bed_room: 1,
            bath_room: 1,
          });
          break;

        case "villa":
        case "farmhouse":
        case "cottage":
          inventories.push({
            property_id: property._id,
            inventory_type: "unit",
            name: "Entire Property",
            description: "Full property booking",
            price: 10000,
            max_guests: 8,
            amenities: ["Pool", "Garden", "WiFi"],
            bed_type: "King",
            bed_room: 4,
            bath_room: 3,
          });
          break;

        case "apartment":
          inventories.push({
            property_id: property._id,
            inventory_type: "unit",
            name: "2BHK Apartment",
            description: "Fully furnished apartment",
            price: 4000,
            max_guests: 4,
            amenities: ["Kitchen", "WiFi", "TV"],
            bed_type: "Queen",
            bed_room: 2,
            bath_room: 2,
          });
          break;

        default:
          break;
      }
    });

    await PropertyInventory.insertMany(inventories);

    console.log("✅ Property Inventory Seeded Successfully");
    process.exit();

  } catch (err) {
    console.error("❌ Error seeding inventory:", err);
    process.exit(1);
  }
};

seedInventory();