import express from "express";
import { getAnnouncements, createAnnouncement, updateAnnouncement, archiveAnnouncement } from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getAnnouncements)
  .post(protect, authorize("admin"), createAnnouncement);

router.route("/:id")
  .put(protect, authorize("admin"), updateAnnouncement);

router.route("/:id/archive")
  .put(protect, authorize("admin"), archiveAnnouncement);

export default router;