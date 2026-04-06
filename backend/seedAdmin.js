const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin/Admin");
require("dotenv").config();

// Connect to MongoDB (Mongoose 7+ doesn't need extra options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedAdmins = async () => {
  try {
    await Admin.deleteMany();

    const hashedPassword = await bcrypt.hash("staynthrilladmin@mail.com", 10);

    await Admin.insertMany([
      {
        adminId: "ADM001",
        firstName: "Super",
        lastName: "Admin",
        email: "superadmin@gmail.com",
        phoneNumber: "9876543210",
        password: hashedPassword,
        role: "super_admin",
        status: "active",
        is_delete: false,
        note: "Has full access",
      },
      {
        adminId: "ADM002",
        firstName: "Operations",
        lastName: "Admin",
        email: "operations@gmail.com",
        phoneNumber: "9876543211",
        password: hashedPassword,
        role: "operations_admin",
        status: "active",
        is_delete: false,
        note: "Handles operations",
      },
      {
        adminId: "ADM003",
        firstName: "Finance",
        lastName: "Admin",
        email: "finance@gmail.com",
        phoneNumber: "9876543212",
        password: hashedPassword,
        role: "financial_admin",
        status: "active",
        is_delete: false,
        note: "Manages finance",
      },
      {
        adminId: "ADM004",
        firstName: "Support",
        lastName: "Admin",
        email: "support@gmail.com",
        phoneNumber: "9876543213",
        password: hashedPassword,
        role: "support_admin",
        status: "active",
        is_delete: false,
        note: "Customer support",
      },
    ]);

    console.log("Admins Seeded Successfully");
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedAdmins();