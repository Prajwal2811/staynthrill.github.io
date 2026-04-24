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

    // ✅ Fetch Managers
    const managers = await Manager.find();

    if (managers.length === 0) {
      console.log("❌ No managers found. Run manager seeder first");
      process.exit();
    }

    // ✅ Map managerId → _id
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

      // ✅ Pick Manager
      const managerKey = managerIds[i % managerIds.length];
      const managerData = managers.find(
        (m) => m.managerId === managerKey
      );

      if (!managerData) continue;

      // ✅ Inherit Manager Config
      const propertyType = managerData.propertyType;
      const engineTypes = managerData.engineTypes;

      // 👉 Assign category smartly (one or multiple)
      let propertyCategories = [];

      if (managerData.propertyCategories.length > 1) {
        propertyCategories = [
          managerData.propertyCategories[
            i % managerData.propertyCategories.length
          ],
        ];
      } else {
        propertyCategories = managerData.propertyCategories;
      }

      vendors.push({
        vendorId: `VEN${String(i + 1).padStart(3, "0")}`,

        firstName,
        lastName,
        email: `${firstName.toLowerCase()}${i + 1}@yopmail.com`,
        phoneNumber: `90000000${String(i + 1).padStart(2, "0")}`,

        businessName: `${firstName} ${lastName} Travels`,
        address: cities[i % cities.length],

        role: roles[i % roles.length],

        // ✅ Manager Mapping
        managerId: managerKey,
        manager: managerMap[managerKey],

        // ✅ IMPORTANT FIELDS (based on manager)
        propertyType,
        engineTypes,
        propertyCategories,

        password: hashedPassword,
        gstNumber: `GST${1000 + i}`,

        status: "active",
        is_delete: false,

        review_status: getRandomStatus(),
        admin_review_comment: "",
      });
    }

    await Vendor.insertMany(vendors);

    console.log(`✅ ${vendors.length} Vendors Seeded Successfully`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeder Error:", err);
    process.exit(1);
  }
};

seedVendors();