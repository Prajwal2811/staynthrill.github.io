const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user/User");
require("dotenv").config();

const reviewStatuses = ["pending", "approved", "rejected"];

// Helper to pick random review status
const getRandomStatus = () =>
  reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedUsers = async () => {
  try {
    await User.deleteMany();

    const hashedPassword = await bcrypt.hash("user123", 10);

    const users = [
      { userId: "USR001", firstName: "Amit", lastName: "Shah", email: "amit@yopmail.com", phoneNumber: "9000100001", status: "active", is_deleted: false, note: "Regular customer" },
      { userId: "USR002", firstName: "Sneha", lastName: "Reddy", email: "sneha@yopmail.com", phoneNumber: "9000100002", status: "active", is_deleted: false, note: "Premium customer" },
      { userId: "USR003", firstName: "Rohit", lastName: "Verma", email: "rohit@yopmail.com", phoneNumber: "9000100003", status: "active", is_deleted: false, note: "System user" },
      { userId: "USR004", firstName: "Priya", lastName: "Mehta", email: "priya@yopmail.com", phoneNumber: "9000100004", status: "active", is_deleted: false },
      { userId: "USR005", firstName: "Vikas", lastName: "Yadav", email: "vikas@yopmail.com", phoneNumber: "9000100005", status: "inactive", is_deleted: true },
      { userId: "USR006", firstName: "Anjali", lastName: "Desai", email: "anjali@yopmail.com", phoneNumber: "9000100006", status: "active", is_deleted: false },
      { userId: "USR007", firstName: "Karan", lastName: "Singh", email: "karan@yopmail.com", phoneNumber: "9000100007", status: "active", is_deleted: true },
      { userId: "USR008", firstName: "Neha", lastName: "Joshi", email: "neha@yopmail.com", phoneNumber: "9000100008", status: "active", is_deleted: false },
      { userId: "USR009", firstName: "Arjun", lastName: "Kumar", email: "arjun@yopmail.com", phoneNumber: "9000100009", status: "active", is_deleted: false },
      { userId: "USR010", firstName: "Riya", lastName: "Shah", email: "riya@yopmail.com", phoneNumber: "9000100010", status: "active", is_deleted: true },
    ];

    const usersWithStatus = users.map(u => ({
      ...u,
      password: hashedPassword,
      review_status: getRandomStatus(),
      admin_review_comment: ""
    }));

    await User.insertMany(usersWithStatus);

    console.log("✅ Users Seeded Successfully (No role field)");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedUsers();