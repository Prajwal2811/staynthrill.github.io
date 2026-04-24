const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Manager = require("../../models/manager/Manager");



// Signup for clients
exports.signupManager = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      propertyType,
      gstNumber
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !propertyType || !gstNumber) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const existingPhone = await Manager.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(409).json({
        message: "Phone number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const count = await Manager.countDocuments();
    const managerId = `MAN${String(count + 1).padStart(3, "0")}`;

    const newManager = await Manager.create({
      managerId,
      firstName,
      lastName,
      email,
      phoneNumber,
      propertyType,
      gstNumber,
      password: hashedPassword,
      status: "active",
      is_delete: false,

      review_status: "pending",
      admin_review_comment: "",
    });

    res.status(201).json({
      message: "Signup successful",
      manager: {
        managerId: newManager.managerId,
        name: `${newManager.firstName} ${newManager.lastName}`,
        email: newManager.email,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};


// Profile update for clients
exports.updateProfile = async (req, res) => {
  try {
    const managerId = req.manager.id; // from JWT

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      propertyType,
      gstNumber
    } = req.body;

    // ✅ 1. Find manager
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        message: "Manager not found",
      });
    }

    // ✅ 2. Email check
    if (email && email !== manager.email) {
      const existingEmail = await Manager.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
      manager.email = email;
    }

    // ✅ 3. Phone check
    if (phoneNumber && phoneNumber !== manager.phoneNumber) {
      const existingPhone = await Manager.findOne({ phoneNumber });
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number already in use",
        });
      }
      manager.phoneNumber = phoneNumber;
    }

    // ✅ 4. Update basic fields
    if (firstName) manager.firstName = firstName;
    if (lastName) manager.lastName = lastName;

    // ✅ 5. Update extra fields (from seeder)
    if (propertyType) {
      const allowedTypes = ["single_property_owner", "multiple_property_owner"];
      if (!allowedTypes.includes(propertyType)) {
        return res.status(400).json({
          message: "Invalid property type",
        });
      }
      manager.propertyType = propertyType;
    }

    if (gstNumber) {
      manager.gstNumber = gstNumber;
    }

    // ⚠️ Optional: If critical fields changed → reset approval
    if (propertyType || gstNumber) {
      manager.review_status = "pending";
      manager.admin_review_comment = "";
    }

    // ✅ 6. Save
    await manager.save();

    // ✅ 7. Response
    res.status(200).json({
      message: "Profile updated successfully",
      manager: {
        managerId: manager.managerId,
        name: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
        phoneNumber: manager.phoneNumber,
        propertyType: manager.propertyType,
        gstNumber: manager.gstNumber,
        review_status: manager.review_status,
      },
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};



// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    manager.resetPasswordToken = hashedOtp;
    manager.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await manager.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ 7. Email content
    const subject = "Password Reset OTP - StayNThrill";

    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="background: #4f46e5; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Password Reset Request</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; color: #333;">
                <p style="font-size: 16px;">Hello <strong>${manager.firstName}</strong>,</p>

                <p style="font-size: 14px; line-height: 1.6;">
                  We received a request to reset your password.
                </p>

                <p style="font-size: 14px; line-height: 1.6;">
                  Use the OTP below to reset your password:
                </p>

                <!-- OTP BOX -->
                <div style="text-align: center; margin: 25px 0;">
                  <span style="display: inline-block; background: #16a34a; color: #ffffff; padding: 15px 25px; font-size: 24px; letter-spacing: 3px; border-radius: 6px;">
                    ${otp}
                  </span>
                </div>

                <p style="font-size: 14px;">
                  This OTP is valid for <strong>10 minutes</strong>.
                </p>

                <p style="font-size: 14px;">
                  If you did not request this, please ignore this email.
                </p>

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

    await transporter.sendMail({
      from: `"StayNThrill" <${process.env.SMTP_USER}>`,
      to: manager.email,
      subject,
      html,
    });

    res.status(200).json({
      message: "OTP sent to your email",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const manager = await Manager.findOne({
      email,
      resetPasswordToken: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!manager) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    manager.password = hashedPassword;

    manager.resetPasswordToken = undefined;
    manager.resetPasswordExpires = undefined;

    await manager.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ 7. Email content
    const subject = "Password Changed Successfully - StayNThrill";

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <table align="center" width="600" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: #16a34a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Password Changed Successfully</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333;">
              <p style="font-size: 16px;">Hello <strong>${manager.firstName}</strong>,</p>

              <p style="font-size: 14px; line-height: 1.6;">
                Your password has been successfully changed.
              </p>

              <p style="font-size: 14px;">
                If you made this change, no further action is required.
              </p>

              <p style="font-size: 14px; color: #dc2626;">
                If you did NOT make this change, please reset your password immediately.
              </p>

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

    await transporter.sendMail({
      from: `"StayNThrill" <${process.env.SMTP_USER}>`,
      to: manager.email,
      subject,
      html,
    });

    res.status(200).json({
      message: "Password reset successful & email sent",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};