const Admin = require("../../models/admin/Admin");
const Vendor = require("../../models/vendor/Vendor");
const Users = require("../../models/user/User");
const Reviews = require("../../models/review/Review");
const Booking = require("../../models/booking/Booking");
const Manager = require("../../models/manager/Manager"); 

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer"); // npm install nodemailer

// ✅ Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: { $ne: "super_admin" } }).sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Admin Status
exports.toggleAdminStatus = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.status = admin.status === "active" ? "inactive" : "active";
    await admin.save();

    res.json({ status: admin.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    // Prevent user from deleting themselves
    if (adminId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Admin.findByIdAndDelete(adminId);

    res.json({ message: "Admin deleted successfully", id: adminId });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get single admin by ID
exports.editAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin); // send full admin data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, role, password, note } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.phoneNumber = phoneNumber || admin.phoneNumber;
    admin.role = role || admin.role;
    admin.note = note || admin.note;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json({
      message: "Admin updated successfully",
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        note: admin.note,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Create new admin and send credentials via email
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, role, password, note } = req.body;

    // Check required fields
    if (!firstName || !email || !role || !password) {
      return res.status(400).json({ message: "First name, email, role, and password are required" });
    }

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Generate adminId
    let lastAdmin = await Admin.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastAdmin && lastAdmin.adminId) {
      const lastNumber = parseInt(lastAdmin.adminId.replace("ADM", ""));
      nextNumber = lastNumber + 1;
    }
    const adminId = "ADM" + nextNumber.toString().padStart(3, "0");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      adminId,
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      password: hashedPassword,
      note,
      status: "active",
    });

    await newAdmin.save();

    // --- Email Setup ---
    // Replace with your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Admin Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Admin Account Has Been Created",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: #4f46e5; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Admin Account Created</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333;">
              <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>

              <p style="font-size: 14px; line-height: 1.6;">
                Your admin account has been successfully created. Below are your login credentials:
              </p>

              <!-- Credentials Box -->
              <table width="100%" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Admin ID:</strong></td>
                  <td style="padding: 8px 0;">${adminId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Password:</strong></td>
                  <td style="padding: 8px 0;">${password}</td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6;">
                For security reasons, we strongly recommend changing your password after your first login.
              </p>

              <!-- Button -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="#" style="background: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                  Login to Your Account
                </a>
              </div>

              <p style="font-size: 14px;">If you did not request this account, please contact support immediately.</p>

              <p style="margin-top: 30px; font-size: 14px;">
                Regards,<br>
                <strong>StayNThrill Admin Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f4f6f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Your Company. All rights reserved.
            </td>
          </tr>

        </table>
      </div>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        // You can still respond success even if email fails
        return res.status(201).json({
          message: "Admin created, but failed to send email",
          admin: newAdmin,
        });
      }
      console.log("Email sent:", info.response);
      res.status(201).json({ message: "Admin created successfully, email sent", admin: newAdmin });
    });
  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};













// ✅ Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ is_delete: false })
      .populate("manager", "firstName lastName managerId") // 🔥 ADD THIS
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Vendor Status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Toggle status
    vendor.status = vendor.status === "active" ? "inactive" : "active";
    await vendor.save();

    // Respond with updated status
    res.json({ status: vendor.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete a vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    await Vendor.findByIdAndDelete(vendorId);

    res.json({ message: "Vendor deleted successfully", id: vendorId });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// view single vendor by ID
exports.viewVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("manager", "firstName lastName managerId");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Update vendor review status and send styled email
exports.updateVendorReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { review_status, remark } = req.body;

  // Validate status
  if (!["approved", "rejected"].includes(review_status)) {
    return res.status(400).json({ message: "Invalid review status" });
  }

  try {
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Update review status and admin comment
    vendor.review_status = review_status;
    if (remark) vendor.admin_review_comment = remark;

    await vendor.save();

    // --- Email Setup ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email subject
    const subject = `Your Vendor Account has been ${review_status}`;

    // Email HTML content (styled similar to admin creation)
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: ${review_status === "approved" ? "#16a34a" : "#dc2626"}; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Vendor Account ${review_status.toUpperCase()}</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333;">
              <p style="font-size: 16px;">Hello <strong>${vendor.firstName}</strong>,</p>

              <p style="font-size: 14px; line-height: 1.6;">
                Your vendor account has been <strong>${review_status}</strong>.
              </p>

              ${
                remark
                  ? `<p style="font-size: 14px; line-height: 1.6;">
                      <strong>Admin Comment:</strong> ${remark}
                    </p>`
                  : ""
              }

              <p style="font-size: 14px;">You can now login to your account to check details.</p>

              <div style="text-align: center; margin: 25px 0;">
                <a href="#" style="background: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                  Login to Your Account
                </a>
              </div>

              <p style="font-size: 14px;">If you did not expect this email, please contact support immediately.</p>

              <p style="margin-top: 30px; font-size: 14px;">
                Regards,<br>
                <strong>StayNThrill Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f4f6f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} StayNThrill. All rights reserved.
            </td>
          </tr>

        </table>
      </div>
    `;

    // Send email
    transporter.sendMail(
      {
        from: `"StayNThrill" <${process.env.SMTP_USER}>`,
        to: vendor.email,
        subject,
        html,
      },
      (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
          return res.status(200).json({
            message: `Vendor ${review_status} successfully, but failed to send email`,
            vendor,
          });
        }

        console.log("Email sent:", info.response);
        res.status(200).json({
          message: `Vendor ${review_status} successfully and email sent`,
          vendor,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all managers
exports.getManagers = async (req, res) => {
  try {
    // sirf non-deleted managers fetch karo
    const managers = await Manager.find({ is_delete: false })
      .sort({ createdAt: -1 });

    res.json(managers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Manager Status
exports.toggleManagerStatus = async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Toggle status
    manager.status = manager.status === "active" ? "inactive" : "active";
    await manager.save();

    // Respond with updated status
    res.json({ status: manager.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete a manager
exports.deleteManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    const manager = await Manager.findById(managerId);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    await Manager.findByIdAndDelete(managerId);

    res.json({ message: "Manager deleted successfully", id: managerId });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// view single manager by ID
exports.viewManager = async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    res.json(manager); // send full manager data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};





// ✅ Update manager review status and send styled email
exports.updateManagerReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { review_status, remark } = req.body;

  // Validate status
  if (!["approved", "rejected"].includes(review_status)) {
    return res.status(400).json({ message: "Invalid review status" });
  }

  try {
    const manager = await Manager.findById(id);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    // Update review status and admin comment
    manager.review_status = review_status;
    if (remark) manager.admin_review_comment = remark;

    await manager.save();

    // --- Email Setup ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email subject
    const subject = `Your Manager Account has been ${review_status}`;

    // Email HTML content (styled similar to admin creation)
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: ${review_status === "approved" ? "#16a34a" : "#dc2626"}; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Manager Account ${review_status.toUpperCase()}</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333;">
              <p style="font-size: 16px;">Hello <strong>${manager.firstName}</strong>,</p>

              <p style="font-size: 14px; line-height: 1.6;">
                Your Manager account has been <strong>${review_status}</strong>.
              </p>

              ${
                remark
                  ? `<p style="font-size: 14px; line-height: 1.6;">
                      <strong>Admin Comment:</strong> ${remark}
                    </p>`
                  : ""
              }

              <p style="font-size: 14px;">You can now login to your account to check details.</p>

              <div style="text-align: center; margin: 25px 0;">
                <a href="#" style="background: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                  Login to Your Account
                </a>
              </div>

              <p style="font-size: 14px;">If you did not expect this email, please contact support immediately.</p>

              <p style="margin-top: 30px; font-size: 14px;">
                Regards,<br>
                <strong>StayNThrill Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f4f6f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} StayNThrill. All rights reserved.
            </td>
          </tr>

        </table>
      </div>
    `;

    // Send email
    transporter.sendMail(
      {
        from: `"StayNThrill" <${process.env.SMTP_USER}>`,
        to: manager.email,
        subject,
        html,
      },
      (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
          return res.status(200).json({
            message: `Manager ${review_status} successfully, but failed to send email`,
            manager,
          });
        }

        console.log("Email sent:", info.response);
        res.status(200).json({
          message: `Manager ${review_status} successfully and email sent`,
          manager,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};








// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await Users.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({ status: user.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// view single user details
exports.viewUser = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};





// Get all users reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "user",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    const formatted = reviews.map((r) => ({
      _id: r._id,
      userName: r.user
        ? `${r.user.firstName} ${r.user.lastName}`
        : "Unknown User", // ✅ FIX
      email: r.user ? r.user.email : "N/A", // ✅ FIX
      title: r.title || "",
      review: r.review || "",
      rating: r.rating || "0/5",
      status: r.status || "pending",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ ERROR in getReviews:", err); // 👈 CHECK THIS LOG
    res.status(500).json({ message: err.message });
  }
};

// Toggle status
exports.toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const review = await Review.findById(id);
    if (!review)
      return res.status(404).json({ message: "Review not found" });

    review.status =
      review.status === "approved" ? "pending" : "approved";

    await review.save();

    res.json({ status: review.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// View single review
exports.viewReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const review = await Review.findById(id).populate(
      "user",
      "firstName lastName email"
    );

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    res.json({
      _id: review._id,
      userName: `${review.user?.firstName} ${review.user?.lastName}`,
      email: review.user?.email,
      title: review.title,
      review: review.review,
      rating: review.rating,
      status: review.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};











// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    console.log("🔥 getBookings HIT");

    const bookings = await Booking.find().populate("user");

    console.log("📦 BOOKINGS:", bookings);

    res.json(bookings);
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// DELETE BOOKING
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Delete booking
    await Booking.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting booking",
    });
  }
};




// VIEW SINGLE BOOKING
exports.viewBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "firstName lastName email") // if user ref exists
      .populate("service", "name"); // optional (if service ref)

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ format response (important for frontend)
    const formatted = {
      _id: booking._id,
      bookingId: booking.bookingId,
      customerName: booking.user
        ? `${booking.user.firstName} ${booking.user.lastName}`
        : "N/A",
      email: booking.user?.email || "N/A",
      service: booking.service?.name || booking.service || "N/A",
      date: booking.date,
      status: booking.status,
    };

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("View Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching booking",
    });
  }
};







exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate status
    const allowedStatuses = ["confirmed", "cancelled", "pending", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // ✅ Find booking (match frontend structure)
    const booking = await Booking.findById(id).populate("user", "firstName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ❌ Prevent update if completed
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be updated",
      });
    }

    // ✅ Update status
    booking.status = status;
    await booking.save();

    // ===============================
    // 📧 EMAIL NOTIFICATION
    // ===============================
    if (booking.user?.email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const subject = `Your Booking has been ${status}`;

      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

            <!-- HEADER -->
            <tr>
              <td style="background: ${
                status === "confirmed"
                  ? "#16a34a"
                  : status === "cancelled"
                  ? "#dc2626"
                  : "#4f46e5"
              }; color: #fff; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Booking ${status.toUpperCase()}</h2>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding: 30px; color: #333;">

                <p style="font-size: 16px;">
                  Hello <strong>${booking.user?.firstName || "User"}</strong>,
                </p>

                <p style="font-size: 14px;">
                  Your booking status has been updated successfully.
                </p>

                <!-- BOOKING DETAILS -->
                <p style="font-size: 14px;">
                  <strong>Booking ID:</strong> ${booking.bookingId}
                </p>

                <p style="font-size: 14px;">
                  <strong>Service:</strong> ${booking.serviceType}
                </p>

                <p style="font-size: 14px;">
                  <strong>Status:</strong> ${status.toUpperCase()}
                </p>

                <div style="text-align: center; margin: 25px 0;">
                  <a href="#"
                    style="background: #4f46e5; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
                    View Booking
                  </a>
                </div>

                <p style="font-size: 13px; color: #555;">
                  If you have any questions, feel free to contact support.
                </p>

                <p style="margin-top: 30px;">
                  Regards,<br>
                  <strong>Your Company Team</strong>
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background: #f4f6f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </td>
            </tr>

          </table>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"Your Company" <${process.env.SMTP_USER}>`,
          to: booking.user.email,
          subject,
          html,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError.message);
      }
    }

    // ✅ RESPONSE
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      status: booking.status,
      booking,
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};