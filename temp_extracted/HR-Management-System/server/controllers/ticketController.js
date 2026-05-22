import Ticket from "../models/Ticket.js";
import { sendEmail } from "../utils/sendEmail.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";

export const createTicket = async (req, res) => {
  try {
    // console.log("--> Hit createTicket API");
    // console.log("User Requesting:", req.user);
    // console.log("Body Data:", req.body);

    // Ensure role check is case-insensitive
    if (req.user.role?.toLowerCase() === "admin") {
      return res.status(403).json({ msg: "Admins cannot create support tickets." });
    }

    const { subject, description, category, priority } = req.body;
    
    const currentUserId = req.user._id || req.user.id;

    if (!currentUserId) {
      // console.log("Error: No User ID found in request.");
      return res.status(400).json({ msg: "Authentication error: User ID missing" });
    }

    const newTicket = await Ticket.create({
      userId: currentUserId,
      subject,
      description,
      category,
      priority
    });

    // console.log("--> Ticket Created Successfully:", newTicket._id);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("--> TICKET CREATION FAILED:", error);
    res.status(500).json({ msg: "Failed to create ticket", error: error.message });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const tickets = await Ticket.find({ userId: currentUserId }).sort("-createdAt");
    res.status(200).json(tickets);
  } catch (error) {
    console.error("--> FETCH MY TICKETS FAILED:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("userId", "name email profilePic").sort("-createdAt");
    res.status(200).json(tickets);
  } catch (error) {
    console.error("--> FETCH ALL TICKETS FAILED:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const addReply = async (req, res) => {
  try {
    const { message, userName } = req.body;
    // console.log(req.body);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    const currentUserId = req.user._id || req.user.id;
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== "admin" && ticket.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ msg: "Not authorized to reply to this ticket" });
    }

    // console.log(req.user);
    // console.log(user)
    const newReply = {
      senderId: currentUserId,
      senderName: userName || "Unknown User",
      role: userRole,
      message
    };
    // console.log(newReply)
    ticket.replies.push(newReply);

    // Auto-reopen ticket if employee replies to a Resolved ticket
    if (userRole === "employee" && ticket.status === "Resolved") {
      ticket.status = "In-Progress";
    }

    await ticket.save();
    // await console.log(">>>>>>> User is here", req.user)
    res.status(200).json(ticket);
  } catch (error) {
    console.error("--> ADD REPLY FAILED:", error);
    res.status(500).json({ msg: "Failed to add reply", error: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate("userId", "name email");

    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    ticket.status = status;
    await ticket.save();

    if (status === "Resolved") {
      try {
        const html = buildEmailTemplate({
          title: "Ticket Resolved",
          color: "#10b981", 
          message: `<p>Your ticket regarding <b>"${ticket.subject}"</b> has been marked as Resolved.</p>`
        });
        await sendEmail({ to: ticket.userId.email, subject: `Resolved: ${ticket.subject}`, html });
      } catch (emailErr) {
        console.error("--> STATUS UPDATED, BUT EMAIL FAILED:", emailErr);
      }
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("--> UPDATE STATUS FAILED:", error);
    res.status(500).json({ msg: "Failed to update status", error: error.message });
  }
};