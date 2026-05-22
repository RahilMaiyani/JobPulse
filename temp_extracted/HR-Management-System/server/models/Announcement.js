import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["Urgent", "General", "Event", "Milestone"], 
      default: "General" 
    },
    targetDepartments: [{ type: String, default: ["All"] }],
    status: { 
      type: String, 
      enum: ["Active", "Archived"], 
      default: "Active" 
    },
    expiresAt: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);