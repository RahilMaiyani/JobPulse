import express from "express";
import { login } from "../controllers/authController.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", strictLimiter, login);

export default router;