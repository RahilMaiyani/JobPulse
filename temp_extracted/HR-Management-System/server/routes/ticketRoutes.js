import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  addReply, 
  updateTicketStatus 
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);

router.post("/:id/reply", protect, addReply);
router.patch("/:id/status", protect, updateTicketStatus);


router.get("/all", protect, authorize("admin"), getAllTickets);

export default router;