const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Vendor = require("./models/vendor/Vendor");
const Manager = require("./models/manager/Manager");

// Config
const roles = ["hotel_vendor", "adventure_vendor"];
const reviewStatuses = ["pending", "approved", "rejected"];

const getRandomStatus = () =>
  reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)];

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Vendor Seeder)"))
  .catch((err) => console.error(err));

const seedVendors = async () => {
  try {
    await Vendor.deleteMany();

    // ✅ Managers fetch
    const managers = await Manager.find();

    if (managers.length === 0) {
      console.log("❌ No managers found. Run seedManagers.js first");
      process.exit();
    }

    // ✅ Map: managerId → _id
    const managerMap = {};
    managers.forEach((m) => {
      managerMap[m.managerId] = m._id;
    });

    const managerIds = Object.keys(managerMap);

    const hashedPassword = await bcrypt.hash("vendor123", 10);

    const firstNames = [
      "Rahul","Priya","Amit","Sneha","Karan","Anjali","Rohit","Pooja",
      "Vikas","Neha","Arjun","Divya","Ravi","Meena","Suresh","Kavita",
      "Nitin","Swati","Gaurav","Komal","Yash","Ritika","Abhishek","Simran",
      "Tarun","Nisha","Varun","Aarti","Sameer","Pallavi","Harsh","Isha",
      "Deepak","Shreya","Vivek","Payal","Manoj","Rekha","Ramesh","Seema"
    ];

    const lastNames = [
      "Sharma","Mehta","Patel","Nair","Verma","Desai","Singh","Kapoor",
      "Yadav","Joshi","Gupta","Agarwal","Bansal","Chopra"
    ];

    const cities = [
      "Mumbai","Pune","Delhi","Nagpur","Surat","Jaipur","Lucknow",
      "Indore","Bhopal","Ahmedabad","Chandigarh","Kochi"
    ];

    const vendors = [];

    for (let i = 0; i < 40; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];

      const managerKey =
        managerIds[i % managerIds.length]; // distribute vendors across managers

      vendors.push({
        vendorId: `VEN${String(i + 1).padStart(3, "0")}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}${i + 1}@yopmail.com`,
        phoneNumber: `90000000${String(i + 1).padStart(2, "0")}`,
        businessName: `${firstName} ${lastName} Travels`,
        address: cities[i % cities.length],
        role: roles[i % 2],
        managerId: managerKey,

        password: hashedPassword,
        gstNumber: `GST${1000 + i}`,
        status: "active",
        is_delete: false,
        note: "",
        review_status: getRandomStatus(),
        admin_review_comment: "",
        manager: managerMap[managerKey], // 🔥 relation
      });
    }

    await Vendor.insertMany(vendors);

    console.log(`✅ ${vendors.length} Vendors Seeded with Manager Mapping`);
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedVendors();