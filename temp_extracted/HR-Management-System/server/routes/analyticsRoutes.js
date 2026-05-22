import express from 'express';
import { getPunctualityAnalytics } from '../controllers/analyticController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();


router.get('/punctuality', protect, authorize("admin"), getPunctualityAnalytics);

export default router;