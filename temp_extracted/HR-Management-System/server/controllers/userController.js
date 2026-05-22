import User from "../models/User.js";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js"; 
import bcrypt from "bcryptjs";

import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, profilePic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      department,
      profilePic
    });

    try {
      const welcomeHtml = buildEmailTemplate({
        title: "Account Created Successfully",
        color: "#4f46e5",
        message: `
          <p style="margin-bottom:20px;">Hello <b>${name}</b>,</p>
          <p style="margin-bottom:20px;">Welcome to the team! Your <b>OfficeLink</b> account has been provisioned by the administrator. You can now access the system using the credentials below:</p>
          
          <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px;">
            <p style="margin:0 0 10px 0; font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase;">Access Credentials</p>
            <p style="margin:4px 0; font-size:14px; color:#1e293b;"><b>Portal ID:</b> ${email}</p>
            <p style="margin:4px 0; font-size:14px; color:#1e293b;"><b>Temporary Password:</b> ${password}</p>
          </div>

          <p style="margin-bottom:20px; font-size:14px; color:#475569;">
            For security reasons, we strongly recommend that you update your password immediately after your first login via the Profile Settings.
          </p>

          <div style="text-align:center; margin-top:32px;">
            <a href="${process.env.CLIENT_URL || '#'}" style="background-color:#4f46e5; color:#ffffff; padding:12px 32px; border-radius:10px; font-weight:700; text-decoration:none; display:inline-block;">
              Login to OfficeLink
            </a>
          </div>
        `
      });

      await sendEmail({
        to: email,
        subject: "Welcome to OfficeLink - Your Account is Ready",
        html: welcomeHtml
      });
    } catch (mailErr) {
      console.error("Welcome email failed to send:", mailErr.message);
    }

    const { password: _, ...safeUser } = user._doc;
    res.json(safeUser);
    
  } catch (err) {
    res.status(500).json({ msg: "Error creating user" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    let users = User.find(query).select("-password");

    if (sort) users = users.sort(sort);

    const result = await users;

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users" }); 
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === "employee" && req.user.id !== id) {
      return res.status(403).json({ msg: "Not allowed" });
    } 

    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      returnDocument: "after"
    }).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error updating user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ msg: "Cannot delete admin" });
    }
    
    await Leave.deleteMany({ userId: id });
    await Attendance.deleteMany({ userId: id });
    
    await User.findByIdAndDelete(id);

    res.json({ msg: "User and related data deleted" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting user" });
  }
};


export const migrateUserBalances = async (req, res) => {
  try {
    const result = await User.updateMany(
      { leaveBalance: { $exists: false } },
      { 
        $set: { 
          leaveBalance: { sick: 12, casual: 12, earned: 0, unpaid: 0 } 
        } 
      }
    );

    res.json({ 
      msg: "Migration complete!", 
      updatedUsersCount: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error migrating users" });
  }
};