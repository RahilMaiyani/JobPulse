import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "png", "jpg", "jpeg", "gif", "doc", "docx", "txt"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Contract", "ID Proof", "Certification", "Other"],
      default: "Other",
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
