const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user/User");
const Review = require("./models/review/Review");

dotenv.config();    

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for Review Seeder"))
  .catch((err) => console.error(err));

const seedReviews = async () => {
  try {
    // Clear old reviews
    await Review.deleteMany();

    // Get users
    const users = await User.find();

    if (!users.length) {
      console.log("❌ No users found. Seed users first!");
      process.exit();
    }

    // Create reviews dynamically
    const reviews = users.slice(0, 5).map((user, index) => ({
      user: user._id, // 🔥 relation
      title: `Review ${index + 1}`,
      rating: ["5/5", "4/5", "3/5", "5/5", "4/5"][index],
      status: ["approved", "approved", "pending", "rejected", "approved"][index],
      review: `This is review ${index + 1} by ${user.firstName}`
    }));

    await Review.insertMany(reviews);

    console.log("✅ Reviews Seeded Successfully with User Relation");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding reviews:", err);
    process.exit(1);
  }
};

seedReviews();