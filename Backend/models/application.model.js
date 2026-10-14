import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview",
        "rejected",
        "hired",
      ],
      default: "applied",
    },

    // appliedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: Same user cannot apply for the same job multiple times
applicationSchema.index(
  { userId: 1, jobId: 1 },
  { unique: true }
);

// Single-field index on jobId for performant recruiter applicant lookups
applicationSchema.index({ jobId: 1 });

export const Application = mongoose.model(
  "Application",
  applicationSchema
);