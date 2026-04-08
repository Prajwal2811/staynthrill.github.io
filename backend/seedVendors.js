const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Vendor = require("./models/vendor/Vendor");
require("dotenv").config();

// ✅ Allowed roles
const roles = ["hotel_vendor", "adventure_vendor", "travel_vendor"];
const reviewStatuses = ["pending", "approved", "rejected"];

// Helper to pick random review status
const getRandomStatus = () => reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedVendors = async () => {
  try {
    await Vendor.deleteMany();
    const hashedPassword = await bcrypt.hash("vendor123", 10);

    const vendors = [
      { vendorId: "VEN001", firstName: "Rahul", lastName: "Sharma", email: "rahul@vendor.com", phoneNumber: "9000000001", businessName: "Rahul Travels", gstNumber: "27ABCDE1234F1Z5", address: "Mumbai, Maharashtra", role: roles[2], status: "active", is_delete: false, note: "Top travel vendor" },
      { vendorId: "VEN002", firstName: "Priya", lastName: "Mehta", email: "priya@vendor.com", phoneNumber: "9000000002", businessName: "Mehta Tours", gstNumber: "27ABCDE5678G1Z2", address: "Pune, Maharashtra", role: roles[1], status: "active", is_delete: false, note: "Adventure expert" },
      { vendorId: "VEN003", firstName: "Amit", lastName: "Patel", email: "amit@vendor.com", phoneNumber: "9000000003", businessName: "Patel Holidays", gstNumber: "24ABCDE4321H1Z9", address: "Ahmedabad, Gujarat", role: roles[0], status: "active", is_delete: false, note: "Hotel booking specialist" },
      { vendorId: "VEN004", firstName: "Sneha", lastName: "Nair", email: "sneha@vendor.com", phoneNumber: "9000000004", businessName: "Nair Travels", gstNumber: "32ABCDE8765J1Z4", address: "Kochi, Kerala", role: roles[2], status: "active", is_delete: false },
      { vendorId: "VEN005", firstName: "Karan", lastName: "Verma", email: "karan@vendor.com", phoneNumber: "9000000005", businessName: "Verma Adventures", gstNumber: "07ABCDE1234K1Z1", address: "Delhi", role: roles[1], status: "active", is_delete: false },
      { vendorId: "VEN006", firstName: "Anjali", lastName: "Desai", email: "anjali@vendor.com", phoneNumber: "9000000006", businessName: "Desai Tours", gstNumber: "24ABCDE5555L1Z2", address: "Surat, Gujarat", role: roles[2], status: "active", is_delete: false },
      { vendorId: "VEN007", firstName: "Rohit", lastName: "Singh", email: "rohit@vendor.com", phoneNumber: "9000000007", businessName: "Singh Hotels", gstNumber: "09ABCDE7777M1Z3", address: "Lucknow, UP", role: roles[0], status: "active", is_delete: false },
      { vendorId: "VEN008", firstName: "Pooja", lastName: "Kapoor", email: "pooja@vendor.com", phoneNumber: "9000000008", businessName: "Kapoor Travels", gstNumber: "06ABCDE8888N1Z4", address: "Chandigarh", role: roles[2], status: "active", is_delete: false },
      { vendorId: "VEN009", firstName: "Vikas", lastName: "Yadav", email: "vikas@vendor.com", phoneNumber: "9000000009", businessName: "Yadav Adventures", gstNumber: "10ABCDE9999O1Z5", address: "Patna, Bihar", role: roles[1], status: "active", is_delete: false },
      { vendorId: "VEN010", firstName: "Neha", lastName: "Joshi", email: "neha@vendor.com", phoneNumber: "9000000010", businessName: "Joshi Holidays", gstNumber: "27ABCDE1010P1Z6", address: "Nagpur, Maharashtra", role: roles[0], status: "active", is_delete: false },
      { vendorId: "VEN011", firstName: "Arjun", lastName: "Reddy", email: "arjun@vendor.com", phoneNumber: "9000000011", businessName: "Reddy Tours", gstNumber: "36ABCDE1111Q1Z7", address: "Hyderabad, Telangana", role: roles[2], status: "active", is_delete: true },
      { vendorId: "VEN012", firstName: "Meera", lastName: "Iyer", email: "meera@vendor.com", phoneNumber: "9000000012", businessName: "Iyer Travels", gstNumber: "33ABCDE1212R1Z8", address: "Chennai, Tamil Nadu", role: roles[2], status: "active", is_delete: true },
      { vendorId: "VEN013", firstName: "Deepak", lastName: "Mishra", email: "deepak@vendor.com", phoneNumber: "9000000013", businessName: "Mishra Hotels", gstNumber: "21ABCDE1313S1Z9", address: "Bhubaneswar, Odisha", role: roles[0], status: "active", is_delete: false },
      { vendorId: "VEN014", firstName: "Simran", lastName: "Kaur", email: "simran@vendor.com", phoneNumber: "9000000014", businessName: "Kaur Adventures", gstNumber: "03ABCDE1414T1Z0", address: "Amritsar, Punjab", role: roles[1], status: "active", is_delete: true },
      { vendorId: "VEN015", firstName: "Nikhil", lastName: "Jain", email: "nikhil@vendor.com", phoneNumber: "9000000015", businessName: "Jain Tours", gstNumber: "08ABCDE1515U1Z1", address: "Jaipur, Rajasthan", role: roles[2], status: "active", is_delete: false },
      { vendorId: "VEN016", firstName: "Riya", lastName: "Shah", email: "riya@vendor.com", phoneNumber: "9000000016", businessName: "Shah Holidays", gstNumber: "24ABCDE1616V1Z2", address: "Vadodara, Gujarat", role: roles[0], status: "active", is_delete: true },
      { vendorId: "VEN017", firstName: "Aditya", lastName: "Kulkarni", email: "aditya@vendor.com", phoneNumber: "9000000017", businessName: "Kulkarni Travels", gstNumber: "27ABCDE1717W1Z3", address: "Pune, Maharashtra", role: roles[2], status: "active", is_delete: false },
      { vendorId: "VEN018", firstName: "Tanvi", lastName: "Patil", email: "tanvi@vendor.com", phoneNumber: "9000000018", businessName: "Patil Adventures", gstNumber: "27ABCDE1818X1Z4", address: "Kolhapur, Maharashtra", role: roles[1], status: "active", is_delete: false },
      { vendorId: "VEN019", firstName: "Suresh", lastName: "Pillai", email: "suresh@vendor.com", phoneNumber: "9000000019", businessName: "Pillai Hotels", gstNumber: "32ABCDE1919Y1Z5", address: "Trivandrum, Kerala", role: roles[0], status: "active", is_delete: true },
      { vendorId: "VEN020", firstName: "Kavita", lastName: "Chopra", email: "kavita@vendor.com", phoneNumber: "9000000020", businessName: "Chopra Tours", gstNumber: "07ABCDE2020Z1Z6", address: "Delhi", role: roles[2], status: "active", is_delete: true },
    ];

    // Add password, random review_status, and admin_review_comment to each vendor
    const vendorsWithStatus = vendors.map(v => ({
      ...v,
      password: hashedPassword,
      review_status: getRandomStatus(),
      admin_review_comment: "" // default empty
    }));

    await Vendor.insertMany(vendorsWithStatus);

    console.log("✅ 20 Vendors Seeded Successfully with random review_status and admin_review_comment");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedVendors();