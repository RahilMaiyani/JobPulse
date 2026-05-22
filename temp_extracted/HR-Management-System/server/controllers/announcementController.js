import Announcement from "../models/Announcement.js";
import User from "../models/User.js"; 
import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";

export const getAnnouncements = async (req, res) => {
  try {
    const isAdmin = req.user.role?.toLowerCase() === "admin";
    let query = {};

    if (!isAdmin) {
      query = {
        status: "Active",
        expiresAt: { $gte: new Date() }
      };
    }

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name")
      .sort("-createdAt");

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch announcements" });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Not authorized." });

    const { title, message, type, targetDepartments, expiresAt } = req.body;
    
    const newAnnouncement = await Announcement.create({
      title,
      message,
      type,
      targetDepartments: targetDepartments?.length ? targetDepartments : ["All"],
      expiresAt,
      createdBy: req.user._id || req.user.id
    });

    let userQuery = {};
    if (!newAnnouncement.targetDepartments.includes("All")) {
      userQuery = { department: { $in: newAnnouncement.targetDepartments } };
    }
    
    const targetUsers = await User.find(userQuery).select("email name");
    const emailList = targetUsers.map(u => u.email).filter(Boolean);

    if (emailList.length > 0) {
      let emailColor = "#4f46e5"; // Indigo
      if (type === "Urgent") emailColor = "#e11d48"; // Rose
      if (type === "Event") emailColor = "#059669"; // Emerald
      if (type === "Milestone") emailColor = "#d97706"; // Amber

      const html = buildEmailTemplate({
        title: `New Broadcast: ${title}`,
        color: emailColor,
        message: `
          <p style="margin-bottom:24px; font-size:16px; color:#0f172a;"><b>${type} Announcement</b></p>
          
          <div style="color:#475569; font-size:15px; line-height:1.7;">
            ${message.replace(/\n/g, '<br/>')}
          </div>

          <div style="margin-top:40px; padding-top:24px; border-top:1px solid #f1f5f9; color:#94a3b8; font-size:13px;">
            Please log in to your OfficeLink dashboard for more details.<br/><br/>
            Best regards,<br/>
            <b style="color:#475569;">Human Resources Team</b>
          </div>
        `
      });

      sendEmail({
        to: emailList,
        subject: `OfficeLink Notice: ${title}`,
        html
      }).catch(err => console.error("Broadcast email failed to send:", err));
    }

    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ msg: "Failed to create announcement" });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Not authorized." });

    const updated = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ msg: "Failed to update announcement" });
  }
};

export const archiveAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Not authorized" });
    
    const updated = await Announcement.findByIdAndUpdate(
        req.params.id, 
        { status: "Archived" }, 
        { returnDocument: 'after' }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ msg: "Failed to archive" });
  }
};