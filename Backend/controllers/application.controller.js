import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { createNotification } from "../utils/notification.helper.js";

const VALID_APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "interview",
  "rejected",
  "hired",
];

/**
 * Apply for a job (Student/Candidate only)
 * Route: POST /api/v1/applications/apply/:jobId
 */
export const applyForJob = asyncHandler(async (req, res) => {
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

  // Application-level duplicate check
  const existingApplication = await Application.findOne({
    userId,
    jobId,
  });

  if (existingApplication) {
    throw new ApiError(
      409,
      "You have already submitted an application for this job"
    );
  }

  try {
    // userId is strictly derived from verified JWT, never trusted from req.body
    const application = await Application.create({
      userId,
      jobId,
      status: "applied",
    });

    const populatedApplication = await Application.findById(application._id)
      .populate("userId", "fullname email phone avatar")
      .populate({
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
          populatedApplication,
          "Application submitted successfully"
        )
      );
  } catch (error) {
    // Catch race-condition duplicate key error (code 11000 from compound unique index)
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "You have already submitted an application for this job"
      );
    }
    throw error;
  }
});

/**
 * Get all applications submitted by the currently logged-in candidate
 * Route: GET /api/v1/applications/my
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const applications = await Application.find({ userId })
    .populate({
      path: "jobId",
      select: "title location salary experience companyId",
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
        applications,
        "Candidate applications retrieved successfully"
      )
    );
});

/**
 * Get applicants for a specific job (Recruiter owner only)
 * Route: GET /api/v1/applications/job/:jobId
 */
export const getApplicantsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const userId = req.user?._id;

  // Recruiter job ownership verification
  if (job.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access denied: You can only view applicants for jobs you created"
    );
  }

  const applications = await Application.find({ jobId })
    .populate("userId", "fullname email phone avatar role")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        job: {
          _id: job._id,
          title: job.title,
          location: job.location,
          totalApplicants: applications.length,
        },
        applications,
      },
      "Job applicants retrieved successfully"
    )
  );
});

/**
 * Get a specific application by ID (Dual-role authorization)
 * - Candidate can view their own application
 * - Recruiter can view an application for a job they own
 * Route: GET /api/v1/applications/:id
 */
export const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID format");
  }

  const application = await Application.findById(id)
    .populate("userId", "fullname email phone avatar")
    .populate({
      path: "jobId",
      populate: {
        path: "companyId",
        select: "name logo location website",
      },
    });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const userId = req.user?._id.toString();
  const userRole = req.user?.role;

  // Dual-role authorization logic (Candidate owner, Recruiter job owner, or Admin)
  const isCandidateOwner = application.userId?._id?.toString() === userId;
  const isRecruiterOwner =
    userRole === "recruiter" &&
    application.jobId?.createdBy?.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isCandidateOwner && !isRecruiterOwner && !isAdmin) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to view this application"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        application,
        "Application details retrieved successfully"
      )
    );
});

/**
 * Update application status (Recruiter owner only)
 * Allowed statuses: applied, shortlisted, interview, rejected, hired
 * Route: PATCH /api/v1/applications/:id/status
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid application ID format");
  }

  if (!status || !status.trim()) {
    throw new ApiError(400, "Status is required");
  }

  const normalizedStatus = status.toLowerCase().trim();

  if (!VALID_APPLICATION_STATUSES.includes(normalizedStatus)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed statuses are: ${VALID_APPLICATION_STATUSES.join(
        ", "
      )}`
    );
  }

  // Find the application and populate its parent Job to verify ownership
  const application = await Application.findById(id).populate("jobId");

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const userId = req.user?._id;

  // Recruiter job ownership verification
  if (application.jobId.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access denied: You can only update application status for jobs you created"
    );
  }

  // Explicitly prevent mutating immutable relationships
  if (req.body.userId) delete req.body.userId;
  if (req.body.jobId) delete req.body.jobId;

  const previousStatus = application.status;

  if (previousStatus !== normalizedStatus) {
    application.status = normalizedStatus;
    await application.save();

    // Notify the candidate about their application status update
    const jobTitle = application.jobId?.title || "your applied job";
    await createNotification({
      userId: application.userId,
      message: `Your application status for "${jobTitle}" has been updated to "${normalizedStatus}".`,
    });
  }

  const updatedApplication = await Application.findById(application._id)
    .populate("userId", "fullname email phone avatar")
    .populate("jobId", "title location");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedApplication,
        `Application status updated to '${normalizedStatus}' successfully`
      )
    );
});
