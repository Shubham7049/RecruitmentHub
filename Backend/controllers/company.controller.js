import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";

/**
 * Create a new company (Recruiter only)
 * Route: POST /api/v1/companies
 */
export const createCompany = asyncHandler(async (req, res) => {
  const { name, logo, about, location, website } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Company name is required");
  }

  if (!location || !location.trim()) {
    throw new ApiError(400, "Company location is required");
  }

  const userId = req.user?._id;

  // Prevent duplicate company registration with the same name by the same recruiter
  const existingCompany = await Company.findOne({
    name: name.trim(),
    createdBy: userId,
  });

  if (existingCompany) {
    throw new ApiError(
      409,
      "You have already registered a company with this name"
    );
  }

  // createdBy is strictly assigned from the authenticated user, never from req.body
  const company = await Company.create({
    name: name.trim(),
    logo: logo?.trim() || "",
    about: about?.trim() || "",
    location: location.trim(),
    website: website?.trim() || "",
    createdBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, company, "Company registered successfully"));
});

/**
 * Get all companies created by the authenticated recruiter
 * Route: GET /api/v1/companies/my
 */
export const getMyCompanies = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const companies = await Company.find({ createdBy: userId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        companies,
        "Recruiter companies fetched successfully"
      )
    );
});

/**
 * Get all companies (with optional search and pagination)
 * Route: GET /api/v1/companies
 */
export const getAllCompanies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { location: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [companies, totalCompanies] = await Promise.all([
    Company.find(query)
      .select("name logo about location website createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Company.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        companies,
        pagination: {
          total: totalCompanies,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCompanies / limitNum),
        },
      },
      "Companies fetched successfully"
    )
  );
});

/**
 * Get company by ID
 * Route: GET /api/v1/companies/:id
 */
export const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid company ID format");
  }

  const company = await Company.findById(id).populate(
    "createdBy",
    "fullname email"
  );

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Company details retrieved successfully"));
});

/**
 * Update company (Recruiter owner only)
 * Route: PATCH /api/v1/companies/:id or PUT /api/v1/companies/:id
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid company ID format");
  }

  const company = await Company.findById(id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Ownership verification
  if (company.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to modify this company"
    );
  }

  // Defensive check: explicitly prevent changing createdBy
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }

  const { name, logo, about, location, website } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Company name cannot be empty");
    }
    company.name = name.trim();
  }

  if (location !== undefined) {
    if (!location.trim()) {
      throw new ApiError(400, "Location cannot be empty");
    }
    company.location = location.trim();
  }

  if (logo !== undefined) {
    company.logo = logo.trim();
  }

  if (about !== undefined) {
    company.about = about.trim();
  }

  if (website !== undefined) {
    company.website = website.trim();
  }

  await company.save();

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Company updated successfully"));
});

/**
 * Delete company (Recruiter owner only)
 * Route: DELETE /api/v1/companies/:id
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid company ID format");
  }

  const company = await Company.findById(id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Ownership verification (Owner recruiter or Admin)
  const isOwner = company.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "Access denied: You are not authorized to delete this company"
    );
  }

  // Relational Integrity: Check if any active jobs reference this company
  const associatedJobsCount = await Job.countDocuments({ companyId: company._id });

  if (associatedJobsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete company: ${associatedJobsCount} active job posting(s) are associated with this company. Please delete or reassign those jobs before deleting the company.`
    );
  }

  await Company.findByIdAndDelete(company._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Company deleted successfully"));
});
