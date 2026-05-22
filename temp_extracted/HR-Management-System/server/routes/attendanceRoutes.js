import express from "express";
import {
  checkIn,
  checkOut,
  todayAttendance,
  getAllAttendance,
  getUserAttendance,
  getMyAttendance,
  getAttendanceFilters,
  bulkFixAttendance,
  fixSingleAttendance
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/today", protect, todayAttendance);
router.get("/all", protect, authorize("admin"), getAllAttendance);
router.get("/user/:userId", protect, getUserAttendance);

router.get("/filters", protect, getAttendanceFilters);
router.get("/me", protect, getMyAttendance);
router.patch("/bulk-fix", protect, authorize("admin"), bulkFixAttendance);
router.patch("/fix/:id", protect, authorize("admin"), fixSingleAttendance);

export default router;