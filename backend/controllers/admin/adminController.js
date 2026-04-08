const Admin = require("../../models/admin/Admin");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer"); // npm install nodemailer

// ✅ Get all admins
exports.getAdmins = async (req, res) => {
  try {
    // role 'super_admin' nahi hone wale admins fetch karo
    const admins = await Admin.find({ role: { $ne: "super_admin" } }).sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Toggle Admin Status
exports.toggleAdminStatus = async (req, res) => {
  // console.log("PATCH request received for id:", req.params.id, "by user:", req.user.id);
  // console.log("PATCH called, params:", req.params);
  // console.log("req.user:", req.user);
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