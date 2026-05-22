import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  migrateUserBalances
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createUser);
router.get("/", protect, authorize("admin"), getUsers);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.put("/:id", protect, updateUser);
router.patch("/migrate-balances", protect, authorize('admin'), migrateUserBalances);

export default router;