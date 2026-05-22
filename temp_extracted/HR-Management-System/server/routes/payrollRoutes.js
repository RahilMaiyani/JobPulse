import express from "express";
import { protect } from "../middleware/authMiddleware.js"; 
import { authorize } from "../middleware/roleMiddleware.js";
import { 
  getPayrollStatus, 
  setupEmployeePayroll, 
  getMyPayslips, 
  generateMonthlyPayroll,
  downloadPayslipPDF
//   seedMissingPayrollData
} from "../controllers/payrollController.js";

const router = express.Router();

router.get("/status", protect, authorize("admin"), getPayrollStatus);
router.put("/setup/:id", protect, authorize("admin"), setupEmployeePayroll);
router.post("/generate", protect, authorize("admin"), generateMonthlyPayroll);
// router.post("/seed-old-users", protect, authorize("admin"), seedMissingPayrollData);

router.get("/my-payslips", protect, getMyPayslips);
router.get("/download/:id", protect, downloadPayslipPDF);

export default router;