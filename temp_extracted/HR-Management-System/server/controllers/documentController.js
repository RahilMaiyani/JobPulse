import Document from "../models/Document.js";
import { cloudinary } from "../middleware/uploadMiddleware.js";


export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ msg: "Title and category required" });
    }

    const fileType = req.file.originalname.split(".").pop().toLowerCase();

    const document = await Document.create({
      userId: req.user.id,
      title,
      category,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      fileType,
      fileSize: req.file.size,
    });

    res.status(201).json({
      msg: "Document uploaded",
      document,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id).populate("userId", "name email");

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    if (document.userId._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }
    
    if (document.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    try {
      await cloudinary.v2.uploader.destroy(document.publicId);
    } catch (err) {
      console.error("Cloudinary delete error:", err.message);
    }

    await Document.findByIdAndDelete(id);

    res.status(200).json({ msg: "Document deleted successfully", userId : document.userId.toString() });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category } = req.body;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    if (document.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (title) document.title = title;
    if (category) document.category = category;

    await document.save();

    res.status(200).json({ msg: "Document updated", document });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
