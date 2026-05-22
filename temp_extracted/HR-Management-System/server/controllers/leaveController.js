import Leave from "../models/Leave.js";
import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";
import User from "../models/User.js";

export const applyLeave = async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ msg: "Invalid date range" });
    }

    const overlapping = await Leave.findOne({
      userId: req.user.id,
      $or: [
        {
          fromDate: { $lte: toDate },
          toDate: { $gte: fromDate }
        }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ msg: "Leave already exists in this range" });
    }

    const leave = await Leave.create({
      userId: req.user.id,
      type,
      fromDate,
      toDate,
      reason
    });

    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id }).populate("userId", "name email profilePic leaveBalance").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("userId", "name email profilePic leaveBalance").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getRecentLeaves = async (req, res) => {
  try {
    const recentLeaves = await Leave.find().sort({ createdAt: -1 }).limit(Number(process.env.RECENT_LEAVES_NO) || 5);
    res.json(recentLeaves);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getActiveLeaves = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaves = await Leave.find({
      $or: [
        { status: "pending" },
        { toDate: { $gte: today } }
      ]
    })
      .populate("userId", "name email profilePic leaveBalance")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getPendingLeavesCount = async (req, res) => {
  try {
    const count = await Leave.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch pending count" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ msg: "Leave not found" });

    const user = await User.findById(leave.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.leaveBalance) {
      user.leaveBalance = { sick: 12, casual: 12, earned: 0, unpaid: 0 };
    }

    const start = new Date(leave.fromDate);
    const end = new Date(leave.toDate);
    const diffDays = Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
    const type = leave.type;

    // Approving the leave: Check balance and deduct
    if (status === "approved" && leave.status !== "approved") {
      if (type !== "unpaid" && user.leaveBalance[type] < diffDays) {
        return res.status(400).json({ 
          msg: `Insufficient balance. Employee has ${user.leaveBalance[type]} ${type} days left, but requested ${diffDays} days.` 
        });
      }

      if (type === "unpaid") {
        user.leaveBalance.unpaid += diffDays;
      } else {
        user.leaveBalance[type] -= diffDays;
      }
      await user.save();
    }

    if (leave.status === "approved" && status !== "approved") {
      if (type === "unpaid") {
        user.leaveBalance.unpaid -= diffDays;
      } else {
        user.leaveBalance[type] += diffDays;
      }
      await user.save();
    }

    leave.status = status;
    if (adminComment) leave.adminComment = adminComment;
    
    await leave.save();

    if (user) {
      const statusColor = 
        status === "approved" ? "#10b981" : 
        status === "rejected" ? "#f43f5e" : "#f59e0b";

      const html = buildEmailTemplate({
        title: "Leave Application Update",
        color: statusColor,
        message: `
          <p style="margin-bottom:24px;">Hello <b>${user.name}</b>,</p>
          
          <p style="margin-bottom:32px;">Your leave request status has been updated to:</p>
          
          <div style="text-align:center; margin-bottom:32px;">
            <span style="background-color:${statusColor}; color:#ffffff; padding:10px 24px; border-radius:50px; font-weight:800; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">
              ${status}
            </span>
          </div>

          <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:12px; font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase;">Leave Type</td>
                <td style="padding-bottom:12px; font-size:14px; color:#1e293b; font-weight:600; text-align:right;">${leave.type}</td>
              </tr>
              <tr>
                <td style="padding-bottom:12px; font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase;">From Date</td>
                <td style="padding-bottom:12px; font-size:14px; color:#1e293b; font-weight:600; text-align:right;">${leave.fromDate.toISOString().slice(0, 10)}</td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase;">To Date</td>
                <td style="font-size:14px; color:#1e293b; font-weight:600; text-align:right;">${leave.toDate.toISOString().slice(0, 10)}</td>
              </tr>
            </table>
          </div>

          ${adminComment ? `
            <div style="border-left:4px solid #e2e8f0; padding-left:20px; margin:24px 0;">
              <p style="margin:0 0 4px 0; font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase;">Administrator Comment</p>
              <p style="margin:0; font-style:italic; color:#475569;">"${adminComment}"</p>
            </div>
          ` : ""}

          <p style="font-size:13px; color:#94a3b8; margin-top:32px; text-align:center;">
            Please login to the OfficeLink dashboard for more details.
          </p>
        `
      });

      await sendEmail({
        to: user.email,
        subject: "Leave Request Update",
        html
      });
    }

    res.json(leave);
  } catch (err) {
    res.status(500).json({ msg: "Error updating leave" });
  }
};