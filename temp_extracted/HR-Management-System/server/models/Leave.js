import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["sick", "casual", "earned", "unpaid"],
      required: true
    },

    fromDate: {
      type: Date,
      required: true
    },

    toDate: {
      type: Date,
      required: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    adminComment: {
      type: String,
      default: ""
    },

    reviewedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);