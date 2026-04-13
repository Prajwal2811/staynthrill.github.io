const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Payment = require("./models/payment/Payment");
const User = require("./models/user/User");
const Hotel = require("./models/hotel/Hotel");
const Room = require("./models/hotel/Room");
const Adventure = require("./models/adventure/Adventure");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for Seeder"))
  .catch(err => console.log(err));

const statuses = ["paid", "pending", "failed"];

const seedPayment = async () => {
  try {
    await Payment.deleteMany();

    const users = await User.find();
    const hotels = await Hotel.find();
    const rooms = await Room.find();
    const adventures = await Adventure.find();

    if (!users.length) {
      console.log("❌ No Users found. Seed Users first.");
      process.exit();
    }

    const payments = [];

    for (let i = 0; i < 20; i++) {

      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const isHotel = Math.random() > 0.5;

      let paymentData = {
        user: user._id,
        status,
        amount: Math.floor(Math.random() * 10000) + 2000
      };

      // 🏨 HOTEL PAYMENT
      if (isHotel && hotels.length && rooms.length) {

        const hotel = hotels[Math.floor(Math.random() * hotels.length)];

        // ✅ SAFE FILTER (avoid undefined error)
        const hotelRooms = rooms.filter(
          r => r.hotel && r.hotel.toString() === hotel._id.toString()
        );

        if (!hotelRooms.length) continue;

        const room = hotelRooms[Math.floor(Math.random() * hotelRooms.length)];

        paymentData.serviceType = "Hotel Stay";
        paymentData.hotel = hotel._id;
        paymentData.room = room._id;
        paymentData.adventure = null;
      }

      // 🧗 ADVENTURE PAYMENT
      else if (adventures.length) {

        const adventure = adventures[Math.floor(Math.random() * adventures.length)];

        paymentData.serviceType = "Adventure Trip";
        paymentData.adventure = adventure._id;
        paymentData.hotel = null;
        paymentData.room = null;
      }

      // ❗ EXTRA SAFETY: ensure serviceType exists
      if (!paymentData.serviceType) continue;

      payments.push(paymentData);
    }

    await Payment.insertMany(payments);

    console.log("✅ Payments Seeded with Proper Relations");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPayment();