const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");



dotenv.config();

const app = express();


// Security headers
app.use(helmet());


// CORS configuration
app.use(cors({
    origin: "*", // You can replace '*' with a specific domain like 'http://localhost:3000'
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch((err) => console.log("MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Server is running...");
});



app.use("/api/auth", require("./routes/admin/authRoutes"));
app.use("/api/admin", require("./routes/admin/adminRoutes"));
app.use("/api/manager", require("./routes/admin/adminRoutes"));  
app.use("/api/vendor", require("./routes/admin/adminRoutes"));  
app.use("/api/user", require("./routes/admin/adminRoutes"));  
app.use("/api/reviews", require("./routes/admin/adminRoutes"));  
app.use("/api/bookings", require("./routes/admin/adminRoutes"));  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
