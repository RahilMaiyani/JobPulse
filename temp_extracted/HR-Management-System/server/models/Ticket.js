import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["IT Support", "HR Inquiry", "Payroll", "Facilities", "General"], 
    default: "General" 
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Urgent"], 
    default: "Medium" 
  },
  status: { 
    type: String, 
    enum: ["Open", "In-Progress", "Resolved", "Closed"], 
    default: "Open" 
  },
  replies: [replySchema], // The Chat History
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);