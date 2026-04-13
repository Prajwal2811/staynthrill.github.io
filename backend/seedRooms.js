const mongoose = require("mongoose");
require("dotenv").config();

const Hotel = require("./models/hotel/Hotel");
const Room = require("./models/hotel/Room");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const roomCategories = ["Standard", "Deluxe", "Super Deluxe", "Suite"];

const randomNum = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seedRooms = async () => {
  try {
    await Room.deleteMany();

    const hotels = await Hotel.find();

    for (let hotel of hotels) {
      let rooms = [];

      roomCategories.forEach((category) => {
        rooms.push({
          hotelId: hotel._id,
          vendorId: hotel.vendorId, // 🔥 relation maintained
          category,
          price: randomNum(1500, 12000),
          totalRooms: randomNum(10, 40),
          maxGuests: randomNum(2, 6),
          amenities: ["WiFi", "AC", "TV"],
        });
      });

      await Room.insertMany(rooms);
      console.log(`🛏 Rooms added for ${hotel.name}`);
    }

    console.log("🎉 Room Seeding Done");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedRooms();