import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/my-documents", getMyDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

router.get("/user/:userId", authorize("admin"), getUserDocuments);

export default router;
