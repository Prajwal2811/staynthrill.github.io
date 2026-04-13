const mongoose = require("mongoose");
require("dotenv").config();

const Vendor = require("./models/vendor/Vendor");
const Hotel = require("./models/hotel/Hotel");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const cities = ["Mumbai", "Pune", "Goa", "Jaipur", "Delhi"];
const amenitiesList = ["WiFi", "AC", "Parking", "Pool", "Breakfast"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedHotels = async () => {
  try {
    await Hotel.deleteMany();

    const vendors = await Vendor.find({ role: "hotel_vendor" });

    for (let vendor of vendors) {
      await Hotel.create({
        name: `${vendor.businessName} Hotel`,
        location: random(cities),
        address: `${random(cities)} Main Road`,
        vendorId: vendor._id,
        vendorName: vendor.firstName + " " + vendor.lastName,
        amenities: amenitiesList.sort(() => 0.5 - Math.random()).slice(0, 4),
        rating: Math.floor(Math.random() * 3) + 3, // 3–5
      });

      console.log(`🏨 Hotel created for ${vendor.businessName}`);
    }

    console.log("🎉 Hotel Seeding Done");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedHotels();