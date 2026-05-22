import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getPendingLeavesCount,
  getActiveLeaves,
  getRecentLeaves
} from "../controllers/leaveController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, applyLeave);
router.get("/me", protect, getMyLeaves);

router.get("/", protect, authorize("admin"), getAllLeaves);
router.patch("/:id", protect, authorize("admin"), updateLeaveStatus);
router.get("/pending-count", protect, authorize("admin"), getPendingLeavesCount);
router.get("/active", protect, authorize("admin"), getActiveLeaves);
router.get("/recent", protect, authorize("admin"), getRecentLeaves);

export default router;