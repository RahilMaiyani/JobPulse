import express from "express";
import { sendCustomEmail } from "../controllers/emailController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/send", protect, authorize("admin"),  sendCustomEmail);

export default router;