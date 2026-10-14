import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "../utils/notification.helper.js";

const VALID_INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
];

/**
 * Schedule a new interview for a job application (Recruiter only)
 * Route: POST /api/v1/interviews
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { applicationId, round, scheduledAt, meetingUrl, interviewer } =
    req.body;

  if (!applicationId || !mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(400, "A valid application ID is required");
  }

  if (!round || !round.trim()) {
    throw new ApiError(400, "Interview round name is required (e.g. 'Technical Round 1')");
  }

  if (!scheduledAt) {
    throw new ApiError(400, "Interview scheduled date and time is required");
  }

  const parsedDate = new Date(scheduledAt);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Invalid scheduled date/time format");
  }

  if (parsedDate <= new Date()) {
    throw new ApiError(
      400,
      "Interview scheduled date and time must be set to a future date"
    );
  }

  // Find the application and populate its parent Job to check ownership
  const application = await Application.findById(applicationId).populate("jobId");
  if (!application) {
    throw new ApiError(404, "Application not found with the provided ID");
  }

  const userId = req.user?._id;

  // Ownership verification: Recruiter must own the job associated with the application
  if (application.jobId.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access denied: You can only schedule interviews for applications under jobs you created"
    );
  }

  // Determine interviewer: defaults to authenticated recruiter or an assigned authorized recruiter
  let assignedInterviewer = userId;
  if (interviewer) {
    if (!mongoose.isValidObjectId(interviewer)) {
      throw new ApiError(400, "Invalid interviewer user ID format");
    }

    const targetInterviewer = await User.findById(interviewer);
    if (!targetInterviewer) {
      throw new ApiError(404, "Assigned interviewer user not found");
    }

    if (targetInterviewer.role !== "recruiter" && targetInterviewer.role !== "admin") {
      throw new ApiError(
        400,
        "Assigned interviewer must have a 'recruiter' or 'admin' role"
      );
    }
    assignedInterviewer = targetInterviewer._id;
  }

  const interview = await Interview.create({
    applicationId: application._id,
    round: round.trim(),
    scheduledAt: parsedDate,
    meetingUrl: meetingUrl?.trim() || "",
    interviewer: assignedInterviewer,
    status: "scheduled",
  });

  // Synchronize application status to 'interview' if currently 'applied' or 'shortlisted'
  if (application.status === "applied" || application.status === "shortlisted") {
    application.status = "interview";
    await application.save();
  }

  // Notify candidate about scheduled interview
  const jobTitle = application.jobId?.title || "your applied role";
  await createNotification({
    userId: application.userId,
    message: `An interview round "${round.trim()}" has been scheduled for your application for "${jobTitle}".`,
  });

  const populatedInterview = await Interview.findById(interview._id)
    .populate({
      path: "applicationId",
      populate: [
        { path: "userId", select: "fullname email phone avatar" },
        { path: "jobId", select: "title location" },
      ],
    })
    .populate("interviewer", "fullname email avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedInterview,
        "Interview scheduled successfully"
      )
    );
});

/**
 * Get interviews relevant to the currently authenticated user
 * - Candidate: interviews for their applications
 * - Recruiter: interviews for jobs they created OR where they are the interviewer
 * Route: GET /api/v1/interviews/my
 */
export const getMyInterviews = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;

  let query = {};

  if (userRole === "student") {
    // Find all application IDs belonging to the candidate
    const myApplications = await Application.find({ userId }).select("_id");
    const myAppIds = myApplications.map((app) => app._id);
    query = { applicationId: { $in: myAppIds } };
  } else {
    // Recruiter: interviews where they are assigned as interviewer OR for jobs they posted
    const myJobs = await mongoose.model("Job").find({ createdBy: userId }).select("_id");
    const myJobIds = myJobs.map((j) => j._id);
    const myJobApplications = await Application.find({
      jobId: { $in: myJobIds },
    }).select("_id");
    const myAppIds = myJobApplications.map((app) => app._id);

    query = {
      $or: [{ interviewer: userId }, { applicationId: { $in: myAppIds } }],
    };
  }

  const interviews = await Interview.find(query)
    .populate({
      path: "applicationId",
      populate: [
        { path: "userId", select: "fullname email phone avatar" },
        {
          path: "jobId",
          select: "title location salary companyId",
          populate: { path: "companyId", select: "name logo website" },
        },
      ],
    })
    .populate("interviewer", "fullname email avatar")
    .sort({ scheduledAt: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interviews,
        "Interviews retrieved successfully"
      )
    );
});

/**
 * Get interview details by ID (Multi-tier authorization)
 * - Candidate can view if it belongs to their application
 * - Recruiter can view if they created the parent job OR are assigned interviewer
 * Route: GET /api/v1/interviews/:id
 */
export const getInterviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid interview ID format");
  }

  const interview = await Interview.findById(id)
    .populate({
      path: "applicationId",
      populate: [
        { path: "userId", select: "fullname email phone avatar" },
        {
          path: "jobId",
          select: "title location createdBy companyId",
          populate: { path: "companyId", select: "name logo website" },
        },
      ],
    })
    .populate("interviewer", "fullname email phone avatar");

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const userId = req.user?._id.toString();

  // Multi-tier authorization checks (Candidate, Job owner, Interviewer, or Admin)
  const isCandidateOwner =
    interview.applicationId?.userId?._id?.toString() === userId;
  const isJobOwner =
    interview.applicationId?.jobId?.createdBy?.toString() === userId;
  const isAssignedInterviewer =
    interview.interviewer?._id?.toString() === userId;
  const isAdmin = req.user?.role === "admin";

  if (!isCandidateOwner && !isJobOwner && !isAssignedInterviewer && !isAdmin) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to view this interview"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interview,
        "Interview details retrieved successfully"
      )
    );
});

/**
 * Update interview details (Recruiter job owner or assigned interviewer)
 * Route: PATCH /api/v1/interviews/:id
 */
export const updateInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid interview ID format");
  }

  const interview = await Interview.findById(id).populate({
    path: "applicationId",
    populate: { path: "jobId", select: "createdBy" },
  });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const userId = req.user?._id.toString();

  const isJobOwner =
    interview.applicationId?.jobId?.createdBy?.toString() === userId;
  const isAssignedInterviewer =
    interview.interviewer?.toString() === userId;

  if (!isJobOwner && !isAssignedInterviewer) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to modify this interview"
    );
  }

  // Prevent modifying application reference
  if (req.body.applicationId) {
    delete req.body.applicationId;
  }

  const { round, scheduledAt, meetingUrl, interviewer, status } = req.body;

  if (round !== undefined) {
    if (!round.trim()) throw new ApiError(400, "Round name cannot be empty");
    interview.round = round.trim();
  }

  if (scheduledAt !== undefined) {
    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid scheduled date/time format");
    }
    if (parsedDate <= new Date()) {
      throw new ApiError(
        400,
        "Interview scheduled date and time must be set to a future date"
      );
    }
    interview.scheduledAt = parsedDate;
  }

  if (meetingUrl !== undefined) {
    interview.meetingUrl = meetingUrl.trim();
  }

  if (status !== undefined) {
    const normalizedStatus = status.toLowerCase().trim();
    if (!VALID_INTERVIEW_STATUSES.includes(normalizedStatus)) {
      throw new ApiError(
        400,
        `Invalid status. Allowed statuses are: ${VALID_INTERVIEW_STATUSES.join(
          ", "
        )}`
      );
    }
    interview.status = normalizedStatus;
  }

  if (interviewer !== undefined) {
    if (!mongoose.isValidObjectId(interviewer)) {
      throw new ApiError(400, "Invalid interviewer user ID format");
    }
    const targetInterviewer = await User.findById(interviewer);
    if (!targetInterviewer) {
      throw new ApiError(404, "Target interviewer user not found");
    }
    if (targetInterviewer.role !== "recruiter" && targetInterviewer.role !== "admin") {
      throw new ApiError(400, "Assigned interviewer must have recruiter or admin role");
    }
    interview.interviewer = targetInterviewer._id;
  }

  await interview.save();

  const updatedInterview = await Interview.findById(interview._id)
    .populate("interviewer", "fullname email avatar")
    .populate({
      path: "applicationId",
      populate: [{ path: "userId", select: "fullname email" }, { path: "jobId", select: "title" }],
    });

  // Notify candidate about interview update
  const candidateId =
    updatedInterview.applicationId?.userId?._id ||
    updatedInterview.applicationId?.userId;
  const jobTitle =
    updatedInterview.applicationId?.jobId?.title || "your applied role";

  if (candidateId) {
    await createNotification({
      userId: candidateId,
      message: `Your interview round "${updatedInterview.round}" for "${jobTitle}" has been updated.`,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedInterview,
        "Interview details updated successfully"
      )
    );
});

/**
 * Cancel an interview (Audit-preserving status transition to 'cancelled')
 * Route: PATCH /api/v1/interviews/:id/cancel
 */
export const cancelInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid interview ID format");
  }

  const interview = await Interview.findById(id).populate({
    path: "applicationId",
    populate: [
      { path: "jobId", select: "createdBy title" },
      { path: "userId", select: "_id" },
    ],
  });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const userId = req.user?._id.toString();

  const isJobOwner =
    interview.applicationId?.jobId?.createdBy?.toString() === userId;
  const isAssignedInterviewer =
    interview.interviewer?.toString() === userId;
  const isAdmin = req.user?.role === "admin";

  if (!isJobOwner && !isAssignedInterviewer && !isAdmin) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to cancel this interview"
    );
  }

  interview.status = "cancelled";
  await interview.save();

  // Notify candidate about cancelled interview
  const cancelledCandidateId =
    interview.applicationId?.userId?._id || interview.applicationId?.userId;
  const cancelledJobTitle =
    interview.applicationId?.jobId?.title || "your applied role";

  if (cancelledCandidateId) {
    await createNotification({
      userId: cancelledCandidateId,
      message: `Your interview round "${interview.round}" for "${cancelledJobTitle}" has been cancelled.`,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interview,
        "Interview has been cancelled successfully"
      )
    );
});
