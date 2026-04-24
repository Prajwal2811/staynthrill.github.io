const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Manager = require("./models/manager/Manager");

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Manager Seeder)"))
  .catch((err) => console.error(err));

const seedManagers = async () => {
  try {
    await Manager.deleteMany();

    const hashedPassword = await bcrypt.hash("manager123", 10);

    const managers = [];

    const firstNames = [
      "Rajesh", "Sunita", "Akhil", "Pooja", "Amit", "Neha", "Ravi", "Kiran",
      "Vikas", "Anjali", "Deepak", "Sneha", "Manoj", "Priya", "Suresh",
      "Kavita", "Nitin", "Swati", "Rahul", "Meena", "Arjun", "Divya",
      "Rohit", "Shreya", "Vivek", "Payal", "Gaurav", "Komal", "Harsh",
      "Isha", "Tarun", "Nisha", "Varun", "Aarti", "Sameer", "Pallavi",
      "Yash", "Ritika", "Abhishek", "Simran"
    ];

    const lastNames = [
      "Patel", "Sharma", "Verma", "Singh", "Gupta", "Mehta", "Jain",
      "Agarwal", "Yadav", "Chopra", "Malhotra", "Kapoor", "Bansal"
    ];

    // ✅ Engine Categories
    const roomBasedTypes = [
      "Hotel",
      "Resort",
      "Hostel/Dorm",
      "Capsule"
    ];

    const productBasedTypes = [
      "Villa",
      "Farmhouse",
      "Apartment",
      "Cottage"
    ];

    for (let i = 0; i < 40; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];

      let engineTypes = [];
      let propertyCategories = [];

      // ✅ Logic for engine types
      if (i % 3 === 0) {
        // Room only
        engineTypes = ["room"];
        propertyCategories = [
          roomBasedTypes[i % roomBasedTypes.length]
        ];
      } else if (i % 3 === 1) {
        // Product only
        engineTypes = ["product"];
        propertyCategories = [
          productBasedTypes[i % productBasedTypes.length]
        ];
      } else {
        // Both
        engineTypes = ["room", "product"];
        propertyCategories = [
          roomBasedTypes[i % roomBasedTypes.length],
          productBasedTypes[i % productBasedTypes.length]
        ];
      }

      managers.push({
        managerId: `MAN${String(i + 1).padStart(3, "0")}`,

        firstName,
        lastName,

        email: `${firstName.toLowerCase()}${i + 1}@yopmail.com`,
        phoneNumber: `80000000${String(i + 1).padStart(2, "0")}`,

        propertyType:
          i % 2 === 0
            ? "single_property_owner"
            : "multiple_property_owner",

        // ✅ NEW FIELDS
        engineTypes,
        propertyCategories,

        gstNumber: `27ABCDE1234F1Z${i}`,

        password: hashedPassword,

        status: "active",
        is_delete: false,

        review_status:
          i % 3 === 0
            ? "approved"
            : i % 3 === 1
            ? "rejected"
            : "pending",

        admin_review_comment:
          i % 3 === 0
            ? "Approved by admin"
            : i % 3 === 1
            ? "Documents not valid"
            : "",

        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    }

    await Manager.insertMany(managers);

    console.log(`✅ ${managers.length} Managers Seeded Successfully`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeder Error:", err);
    process.exit(1);
  }
};

seedManagers();