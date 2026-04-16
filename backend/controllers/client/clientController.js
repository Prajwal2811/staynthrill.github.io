const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../../models/user/User");


// Login for clients
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Step 1: Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Step 2: Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // ✅ Step 3: Check deleted
    if (user.is_deleted) {
      return res.status(403).json({ message: "Account is deleted" });
    }

    // ✅ Step 4: Check status
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    // ✅ Step 5: Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Step 6: Token generate
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Step 7: Response (same frontend-friendly format)
    res.json({
      message: "Login success",
      token,
      user: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};





// Signup for clients
exports.signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password
    } = req.body;

    // ✅ 1. Validate
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ 2. Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // ✅ 3. Check existing phone
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(409).json({
        message: "Phone number already registered",
      });
    }

    // ✅ 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 5. Generate userId (simple auto)
    const count = await User.countDocuments();
    const userId = `USR${String(count + 1).padStart(3, "0")}`;

    // ✅ 6. Create user
    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      status: "active",
      is_deleted: false,
      review_status: "pending", // 👈 important (admin approval)
      admin_review_comment: "",
    });

    // ✅ 7. Response
    res.status(201).json({
      message: "Signup successful",
      user: {
        userId: newUser.userId,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
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
    const userId = req.user.id; // from JWT middleware

    const {
      firstName,
      lastName,
      email,
      phoneNumber
    } = req.body;

  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
      user.email = email;
    }

 
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number already in use",
        });
      }
      user.phoneNumber = phoneNumber;
    }

   
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;



    await user.save();

   
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
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

    // ✅ 1. Validate
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ 2. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ 4. Hash OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ✅ 5. Save OTP + expiry
    user.resetPasswordToken = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // ✅ 6. Email transporter
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
                <p style="font-size: 16px;">Hello <strong>${user.firstName}</strong>,</p>

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

    // ✅ 8. Send email
    await transporter.sendMail({
      from: `"StayNThrill" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });

    // ✅ 9. Response
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

    // ✅ 1. Validate input
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

    // ✅ 2. Hash OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ✅ 3. Find user with valid OTP
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // ✅ 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // ✅ 5. Clear OTP fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // ✅ 6. Setup mail transporter
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
              <p style="font-size: 16px;">Hello <strong>${user.firstName}</strong>,</p>

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

    // ✅ 8. Send email
    await transporter.sendMail({
      from: `"StayNThrill" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });

    // ✅ 9. Final response
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