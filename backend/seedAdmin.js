const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin/Admin");
require("dotenv").config();

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
        firstName: "Prajwal",
        lastName: "Ingole",
        email: "superadmin@gmail.com", // change if needed
        phoneNumber: "9876543210",
        password: hashedPassword,
        role: "super_admin",
        status: "active",
        is_delete: false,
        note: "Has full access",
      },
      {
        adminId: "ADM002",
        firstName: "Priya",
        lastName: "S",
        email: "priya@gmail.com",
        phoneNumber: "9876543211",
        password: hashedPassword,
        role: "operations_admin",
        status: "active",
        is_delete: false,
        note: "Handles operations",
      },
      {
        adminId: "ADM003",
        firstName: "Astha",
        lastName: "M",
        email: "astha@gmail.com",
        phoneNumber: "9876543212",
        password: hashedPassword,
        role: "financial_admin",
        status: "active",
        is_delete: false,
        note: "Manages finance",
      },
      {
        adminId: "ADM004",
        firstName: "Hemchandra",
        lastName: "N",
        email: "hemchandra@gmail.com",
        phoneNumber: "9876543213",
        password: hashedPassword,
        role: "support_admin",
        status: "active",
        is_delete: false,
        note: "Customer support",
      },
      {
        adminId: "ADM005",
        firstName: "Devshri",
        lastName: "B",
        email: "devshri@gmail.com",
        phoneNumber: "9876543278",
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