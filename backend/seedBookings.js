const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Booking = require("./models/booking/Booking");
const User = require("./models/user/User");

dotenv.config();

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for Booking Seeder"))
  .catch((err) => console.error(err));

const services = ["Hotel Stay", "Adventure Trip"];

// 👉 bias: 70% pending
const getRandomStatus = () => {
  const rand = Math.random();

  if (rand < 0.7) return "pending";
  if (rand < 0.9) return "confirmed";
  return "cancelled";
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDate = () => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 10);
  today.setDate(today.getDate() + randomDays);
  return today;
};

const seedBookings = async () => {
  try {
    await Booking.deleteMany();

    const users = await User.find();

    if (users.length === 0) {
      console.log("❌ No users found. Please run userSeeder first.");
      process.exit();
    }

    const bookings = [];
    let count = 1;

    const TOTAL_BOOKINGS = 50;

    // ==================================================
    // 👉 REAL DUPLICATE (ACCIDENTAL COPY SIMULATION)
    // ==================================================
    const duplicateUser = users[0];

    const duplicateBaseBooking = {
      user: duplicateUser._id,
      customerName: duplicateUser.firstName + " " + duplicateUser.lastName,
      email: duplicateUser.email,
      service: "Hotel Stay",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // same fixed date
      status: "pending",
    };

    // 👉 create 3 EXACT duplicates (same data, accidental copy)
    for (let d = 0; d < 3; d++) {
      bookings.push({
        bookingId: "DUP" + (2000 + d), // only this changes
        ...duplicateBaseBooking,
      });
    }

    // ==================================================
    // 👉 NORMAL + SOME CONFLICT DATA
    // ==================================================
    const conflictUser = users[0];
    const conflictDate = new Date();
    conflictDate.setDate(conflictDate.getDate() + 2);

    for (let i = 0; i < TOTAL_BOOKINGS; i++) {
      let bookingData;

      if (i < 4) {
        // conflict bookings (same user, same date, same service)
        bookingData = {
          bookingId: "BK" + (1000 + i),
          user: conflictUser._id,
          customerName: conflictUser.firstName + " " + conflictUser.lastName,
          email: conflictUser.email,
          service: "Hotel Stay",
          date: conflictDate,
          status: "pending",
        };
      } else {
        const user = getRandom(users);

        bookingData = {
          bookingId: "BK" + (1000 + count),
          user: user._id,
          customerName: user.firstName + " " + user.lastName,
          email: user.email,
          service: getRandom(services),
          date: generateDate(),
          status: getRandomStatus(),
        };
      }

      bookings.push(bookingData);
      count++;
    }

    await Booking.insertMany(bookings);

    console.log(
      "✅ Bookings seeded successfully (conflicts + real duplicate copies added)"
    );
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding bookings:", error);
    process.exit(1);
  }
};

seedBookings();