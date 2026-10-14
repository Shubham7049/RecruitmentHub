import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Profile } from "../models/profile.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { Interview } from "../models/interview.model.js";

/**
 * Get high-level platform statistics (Admin only)
 * Route: GET /api/v1/admin/stats
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    totalApplications,
    totalInterviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "recruiter" }),
    Company.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Interview.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          total: totalUsers,
          students: totalStudents,
          recruiters: totalRecruiters,
        },
        companies: totalCompanies,
        jobs: totalJobs,
        applications: totalApplications,
        interviews: totalInterviews,
      },
      "Platform analytics retrieved successfully"
    )
  );
});

/**
 * Get all users with optional role filtering, search, and pagination (Admin only)
 * Route: GET /api/v1/admin/users
 */
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (role && ["student", "recruiter", "admin"].includes(role.toLowerCase())) {
    query.role = role.toLowerCase();
  }

  if (search && search.trim()) {
    query.$or = [
      { fullname: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { username: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalUsers / limitNum) || 1,
        },
      },
      "Users fetched successfully"
    )
  );
});

/**
 * Get detailed user information by ID (Admin only)
 * Route: GET /api/v1/admin/users/:id
 */
export const getUserByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const profile = await Profile.findOne({ userId: user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        profile: profile || null,
      },
      "User details retrieved successfully"
    )
  );
});

/**
 * Delete a user account (Admin moderation)
 * Route: DELETE /api/v1/admin/users/:id
 */
export const deleteUserAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  if (id === req.user?._id.toString()) {
    throw new ApiError(400, "Admins cannot delete their own account");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Clean up associated profile
  await Profile.findOneAndDelete({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User account removed successfully"));
});

/**
 * Delete / moderate inappropriate job platform-wide (Admin only)
 * Route: DELETE /api/v1/admin/jobs/:id
 */
export const deleteJobAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  await Job.findByIdAndDelete(job._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Job removed by administrator successfully"));
});

/**
 * Delete / moderate inappropriate company platform-wide (Admin only)
 * Route: DELETE /api/v1/admin/companies/:id
 */
export const deleteCompanyAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid company ID format");
  }

  const company = await Company.findById(id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  await Company.findByIdAndDelete(company._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Company removed by administrator successfully")
    );
});

/**
 * View platform-wide applications for moderation/audit (Admin only)
 * Route: GET /api/v1/admin/applications
 */
export const getAllApplicationsAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status.toLowerCase();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("userId", "fullname email role")
      .populate({
        path: "jobId",
        select: "title location companyId",
        populate: { path: "companyId", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Application.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      "Platform applications retrieved successfully"
    )
  );
});

/**
 * View platform-wide interviews for moderation/audit (Admin only)
 * Route: GET /api/v1/admin/interviews
 */
export const getAllInterviewsAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status.toLowerCase();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [interviews, total] = await Promise.all([
    Interview.find(query)
      .populate("interviewer", "fullname email role")
      .populate({
        path: "applicationId",
        populate: [
          { path: "userId", select: "fullname email" },
          { path: "jobId", select: "title" },
        ],
      })
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Interview.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        interviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      "Platform interviews retrieved successfully"
    )
  );
});
