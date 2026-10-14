import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SavedJob } from "../models/savedJob.model.js";
import { Job } from "../models/job.model.js";

/**
 * Save / Bookmark a job posting
 * Route: POST /api/v1/saved-jobs/:jobId
 */
export const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  // Verify the job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found with the provided ID");
  }

  const userId = req.user?._id;

  // Application-level check
  const existingSavedJob = await SavedJob.findOne({ userId, jobId });
  if (existingSavedJob) {
    throw new ApiError(409, "You have already saved this job");
  }

  try {
    // userId is strictly derived from verified JWT, never trusted from req.body
    const savedJob = await SavedJob.create({
      userId,
      jobId,
    });

    const populatedSavedJob = await SavedJob.findById(savedJob._id).populate({
      path: "jobId",
      select: "title location salary experience companyId",
      populate: {
        path: "companyId",
        select: "name logo location website",
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          populatedSavedJob,
          "Job saved to your bookmarks successfully"
        )
      );
  } catch (error) {
    // Catch database-level compound unique index collision (code 11000)
    if (error.code === 11000) {
      throw new ApiError(409, "You have already saved this job");
    }
    throw error;
  }
});

/**
 * Unsave / Remove a bookmarked job
 * Route: DELETE /api/v1/saved-jobs/:jobId
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const userId = req.user?._id;

  // Strict ownership matching: can only delete where userId matches authenticated user
  const deletedSavedJob = await SavedJob.findOneAndDelete({
    userId,
    jobId,
  });

  if (!deletedSavedJob) {
    throw new ApiError(
      404,
      "Saved job not found in your bookmarks list"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job removed from your saved bookmarks"));
});

/**
 * Get all saved jobs for the currently authenticated user
 * Route: GET /api/v1/saved-jobs
 */
export const getMySavedJobs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const savedJobs = await SavedJob.find({ userId })
    .populate({
      path: "jobId",
      select: "title description location salary experience companyId createdAt",
      populate: {
        path: "companyId",
        select: "name logo location website",
      },
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        savedJobs,
        "Saved jobs retrieved successfully"
      )
    );
});

/**
 * Check whether a specific job is saved by the authenticated user
 * Route: GET /api/v1/saved-jobs/check/:jobId
 */
export const checkIsJobSaved = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const userId = req.user?._id;

  const exists = await SavedJob.exists({ userId, jobId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobId,
        isSaved: Boolean(exists),
      },
      "Saved status checked successfully"
    )
  );
});
