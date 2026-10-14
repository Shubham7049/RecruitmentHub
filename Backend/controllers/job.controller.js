import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

/**
 * Create a new job posting (Recruiter only)
 * Route: POST /api/v1/jobs
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    salary,
    experience,
    companyId,
    location,
  } = req.body;

  // Basic field validations
  if (!title || !title.trim()) {
    throw new ApiError(400, "Job title is required");
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, "Job description is required");
  }

  if (salary === undefined || salary === null || isNaN(Number(salary)) || Number(salary) < 0) {
    throw new ApiError(400, "A valid non-negative salary is required");
  }

  if (experience === undefined || experience === null || isNaN(Number(experience)) || Number(experience) < 0) {
    throw new ApiError(400, "A valid non-negative experience (in years) is required");
  }

  if (!location || !location.trim()) {
    throw new ApiError(400, "Job location is required");
  }

  if (!companyId || !mongoose.isValidObjectId(companyId)) {
    throw new ApiError(400, "A valid company ID is required");
  }

  const userId = req.user?._id;

  // Verify the target company exists
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found with the provided ID");
  }

  // Cross-entity ownership check: Recruiter must own the company they are posting for
  if (company.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access denied: You can only post jobs under a company that you registered and own"
    );
  }

  // Format requirements array
  let formattedRequirements = [];
  if (Array.isArray(requirements)) {
    formattedRequirements = requirements.map((r) => String(r).trim()).filter(Boolean);
  } else if (typeof requirements === "string" && requirements.trim().length > 0) {
    formattedRequirements = requirements.split(",").map((r) => r.trim()).filter(Boolean);
  }

  // createdBy is strictly assigned from the authenticated user, never from req.body
  const job = await Job.create({
    title: title.trim(),
    description: description.trim(),
    requirements: formattedRequirements,
    salary: Number(salary),
    experience: Number(experience),
    companyId: company._id,
    createdBy: userId,
    location: location.trim(),
  });

  const populatedJob = await Job.findById(job._id).populate(
    "companyId",
    "name logo location website"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedJob, "Job posted successfully"));
});

/**
 * Get all jobs created by the authenticated recruiter
 * Route: GET /api/v1/jobs/my
 */
export const getMyJobs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const jobs = await Job.find({ createdBy: userId })
    .populate("companyId", "name logo location website")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, jobs, "Recruiter jobs retrieved successfully"));
});

/**
 * Get all jobs with filtering, search, and pagination
 * Route: GET /api/v1/jobs
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    experience,
    minSalary,
    companyId,
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  // Keyword search across title and description
  if (keyword && keyword.trim()) {
    query.$or = [
      { title: { $regex: keyword.trim(), $options: "i" } },
      { description: { $regex: keyword.trim(), $options: "i" } },
    ];
  }

  // Location filter
  if (location && location.trim()) {
    query.location = { $regex: location.trim(), $options: "i" };
  }

  // Experience filter (jobs requiring up to specified experience)
  if (experience !== undefined && !isNaN(Number(experience))) {
    query.experience = { $lte: Number(experience) };
  }

  // Minimum salary filter
  if (minSalary !== undefined && !isNaN(Number(minSalary))) {
    query.salary = { $gte: Number(minSalary) };
  }

  // Filter by company
  if (companyId && mongoose.isValidObjectId(companyId)) {
    query.companyId = companyId;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, totalJobs] = await Promise.all([
    Job.find(query)
      .populate("companyId", "name logo location website")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total: totalJobs,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalJobs / limitNum),
        },
      },
      "Jobs retrieved successfully"
    )
  );
});

/**
 * Get job details by ID
 * Route: GET /api/v1/jobs/:id
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const job = await Job.findById(id)
    .populate("companyId", "name logo about location website")
    .populate("createdBy", "fullname email");

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job details retrieved successfully"));
});

/**
 * Update a job posting (Recruiter owner only)
 * Route: PATCH /api/v1/jobs/:id or PUT /api/v1/jobs/:id
 */
export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const userId = req.user?._id;

  // Ownership verification: Only the recruiter who posted the job can update it
  if (job.createdBy.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to modify this job posting"
    );
  }

  // Defensive check: explicitly prevent changing createdBy
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }

  const {
    title,
    description,
    requirements,
    salary,
    experience,
    companyId,
    location,
  } = req.body;

  // If changing company, verify that the new company exists and belongs to the recruiter
  if (companyId) {
    if (!mongoose.isValidObjectId(companyId)) {
      throw new ApiError(400, "Invalid target company ID format");
    }

    if (companyId.toString() !== job.companyId.toString()) {
      const targetCompany = await Company.findById(companyId);
      if (!targetCompany) {
        throw new ApiError(404, "Target company not found");
      }

      if (targetCompany.createdBy.toString() !== userId.toString()) {
        throw new ApiError(
          403,
          "Access denied: You cannot transfer this job to a company you do not own"
        );
      }
      job.companyId = targetCompany._id;
    }
  }

  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, "Job title cannot be empty");
    job.title = title.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) throw new ApiError(400, "Job description cannot be empty");
    job.description = description.trim();
  }

  if (salary !== undefined) {
    if (isNaN(Number(salary)) || Number(salary) < 0) {
      throw new ApiError(400, "Salary must be a valid non-negative number");
    }
    job.salary = Number(salary);
  }

  if (experience !== undefined) {
    if (isNaN(Number(experience)) || Number(experience) < 0) {
      throw new ApiError(400, "Experience must be a valid non-negative number");
    }
    job.experience = Number(experience);
  }

  if (location !== undefined) {
    if (!location.trim()) throw new ApiError(400, "Job location cannot be empty");
    job.location = location.trim();
  }

  if (requirements !== undefined) {
    if (Array.isArray(requirements)) {
      job.requirements = requirements.map((r) => String(r).trim()).filter(Boolean);
    } else if (typeof requirements === "string") {
      job.requirements = requirements.split(",").map((r) => r.trim()).filter(Boolean);
    }
  }

  await job.save();

  const updatedJob = await Job.findById(job._id).populate(
    "companyId",
    "name logo location website"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedJob, "Job updated successfully"));
});

/**
 * Delete a job posting (Recruiter owner only, with relational application integrity check)
 * Route: DELETE /api/v1/jobs/:id
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid job ID format");
  }

  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const userId = req.user?._id;

  // Ownership verification (Job owner recruiter or Admin)
  const isOwner = job.createdBy.toString() === userId.toString();
  const isAdmin = req.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to delete this job posting"
    );
  }

  // Relational Integrity: Check if any candidates have already applied
  const applicationCount = await Application.countDocuments({ jobId: job._id });

  if (applicationCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete job: ${applicationCount} candidate application(s) are associated with this job. Deleting the job would destroy applicant histories. Consider closing or archiving the job instead.`
    );
  }

  await Job.findByIdAndDelete(job._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Job deleted successfully"));
});
