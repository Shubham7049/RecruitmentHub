import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";

/**
 * Create/Initialize profile for the currently authenticated user
 * Route: POST /api/v1/profiles
 */
export const createProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to create a profile");
  }

  // Prevent duplicate profiles for the same user
  const existingProfile = await Profile.findOne({ userId });
  if (existingProfile) {
    throw new ApiError(
      409,
      "Profile already exists for this user. Use the update profile endpoint to make changes."
    );
  }

  const { dob, skills, education, experience, projects, resumeUrl } = req.body;

  // Validate DOB if provided
  let parsedDob;
  if (dob) {
    parsedDob = new Date(dob);
    if (isNaN(parsedDob.getTime())) {
      throw new ApiError(400, "Invalid Date of Birth format. Please provide a valid date.");
    }
  }

  // Format skills: support both array of strings and comma-separated string
  let formattedSkills = [];
  if (Array.isArray(skills)) {
    formattedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof skills === "string" && skills.trim().length > 0) {
    formattedSkills = skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  // Format education: support array of strings
  let formattedEducation = [];
  if (Array.isArray(education)) {
    formattedEducation = education.map((e) => String(e).trim()).filter(Boolean);
  } else if (typeof education === "string" && education.trim().length > 0) {
    formattedEducation = education.split(",").map((e) => e.trim()).filter(Boolean);
  }

  // Create the profile bound strictly to the authenticated user ID
  const profile = await Profile.create({
    userId, // Always derived from req.user, never trusted from req.body
    dob: parsedDob,
    skills: formattedSkills,
    education: formattedEducation,
    experience: Array.isArray(experience) ? experience : [],
    projects: Array.isArray(projects) ? projects : [],
    resumeUrl: resumeUrl?.trim() || "",
  });

  const populatedProfile = await Profile.findById(profile._id).populate(
    "userId",
    "fullname email username role avatar phone"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedProfile, "Profile created successfully"));
});

/**
 * Get profile of the currently authenticated user
 * Route: GET /api/v1/profiles/me
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to view profile");
  }

  // Strictly query by the authenticated user's ID
  const profile = await Profile.findOne({ userId }).populate(
    "userId",
    "fullname email username role avatar phone"
  );

  if (!profile) {
    throw new ApiError(
      404,
      "Profile not found for this user. Please initialize your profile first."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile retrieved successfully"));
});

/**
 * Update profile of the currently authenticated user
 * Route: PUT /api/v1/profiles/me or PATCH /api/v1/profiles/me
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to update profile");
  }

  // Locate the profile owned by the authenticated user
  const profile = await Profile.findOne({ userId });

  if (!profile) {
    throw new ApiError(
      404,
      "Profile not found. Please create your profile before attempting to update it."
    );
  }

  const { dob, skills, education, experience, projects, resumeUrl } = req.body;

  // Defensive check: explicitly ensure userId cannot be modified via update payload
  if (req.body.userId && String(req.body.userId) !== String(userId)) {
    throw new ApiError(403, "Forbidden: You cannot transfer or reassign profile ownership");
  }

  // Update fields conditionally if provided
  if (dob !== undefined) {
    const parsedDob = new Date(dob);
    if (isNaN(parsedDob.getTime())) {
      throw new ApiError(400, "Invalid Date of Birth format");
    }
    profile.dob = parsedDob;
  }

  if (skills !== undefined) {
    if (Array.isArray(skills)) {
      profile.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      profile.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  if (education !== undefined) {
    if (Array.isArray(education)) {
      profile.education = education.map((e) => String(e).trim()).filter(Boolean);
    } else if (typeof education === "string") {
      profile.education = education.split(",").map((e) => e.trim()).filter(Boolean);
    }
  }

  if (experience !== undefined) {
    if (!Array.isArray(experience)) {
      throw new ApiError(400, "Experience must be an array of experience objects");
    }
    profile.experience = experience;
  }

  if (projects !== undefined) {
    if (!Array.isArray(projects)) {
      throw new ApiError(400, "Projects must be an array of project objects");
    }
    profile.projects = projects;
  }

  if (resumeUrl !== undefined) {
    profile.resumeUrl = resumeUrl.trim();
  }

  await profile.save();

  const updatedProfile = await Profile.findById(profile._id).populate(
    "userId",
    "fullname email username role avatar phone"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile updated successfully"));
});
