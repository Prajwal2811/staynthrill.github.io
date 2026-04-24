const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user/User");
const Property = require("./models/hotel/Property");

dotenv.config();

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for Property Seeder"))
  .catch((err) => console.error(err));

const seedProperties = async () => {
  try {
    // Clear old data
    await Property.deleteMany();

    // Get users
    const users = await User.find();

    if (users.length < 2) {
      console.log("❌ Not enough users. Seed users first!");
      process.exit();
    }

    // Split users
    const managers = users.slice(0, 5);
    const vendors = users.slice(5, 10);

    const categories = [
      "hotel", "resort", "hostel", "capsule",
      "villa", "farmhouse", "apartment", "cottage"
    ];

    const engineTypes = ["room", "product"];

    const cities = [
      { state: "Maharashtra", city: "Pune" },
      { state: "Goa", city: "North Goa" },
      { state: "Delhi", city: "New Delhi" },
      { state: "Maharashtra", city: "Mumbai" },
      { state: "Rajasthan", city: "Jaipur" },
      { state: "Punjab", city: "Amritsar" },
      { state: "Karnataka", city: "Bangalore" },
      { state: "Himachal Pradesh", city: "Manali" }
    ];

    // ⭐ Property Name Pools
    const hotelNames = [
      "Taj Hotel",
      "Oberoi Grand",
      "Leela Palace",
      "ITC Royal",
      "Radisson Blu",
      "Marriott Suites",
      "Hyatt Regency",
      "The Grand Palace",
      "Sunset Residency",
      "Royal Orchid Hotel"
    ];

    const resortNames = [
      "Palm Paradise Resort",
      "Blue Lagoon Resort",
      "Sea Breeze Retreat",
      "Mountain Escape Resort",
      "Golden Sands Resort"
    ];

    const villaNames = [
      "Green Valley Villa",
      "Sunshine Villa",
      "Lakeview Villa",
      "Luxury Hillside Villa"
    ];

    const genericNames = [
      "Comfort Stay",
      "Urban Nest",
      "Happy Homes",
      "Elite Stays",
      "Prime Residency"
    ];

    // 🎯 Helper function for name
    const getPropertyName = (category, index) => {
      if (category === "hotel") return hotelNames[index % hotelNames.length];
      if (category === "resort") return resortNames[index % resortNames.length];
      if (category === "villa") return villaNames[index % villaNames.length];
      return genericNames[index % genericNames.length];
    };

    // Create properties
    const properties = managers.map((manager, index) => {
      const category = categories[index % categories.length];

      return {
        name: getPropertyName(category, index), // ✅ added name
        manager_id: manager._id,
        vendor_id: vendors[index % vendors.length]?._id,

        country: "India",
        state: cities[index % cities.length].state,
        city: cities[index % cities.length].city,
        street: `Street ${index + 1}`,
        pincode: `${400000 + index}`,

        property_category: category,
        engine_type: engineTypes[index % engineTypes.length],
      };
    });

    await Property.insertMany(properties);

    console.log("✅ Properties Seeded Successfully with Names 🚀");
    process.exit();

  } catch (err) {
    console.error("❌ Error seeding properties:", err);
    process.exit(1);
  }
};

seedProperties();