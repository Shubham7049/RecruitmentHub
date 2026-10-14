import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index:true
    },

    round: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    meetingUrl: {
      type: String,
      trim: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model(
  "Interview",
  interviewSchema
);