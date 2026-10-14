import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

/**
 * Generate Access and Refresh tokens for a given user ID
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

/**
 * Register a new user (student or recruiter)
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password, role, phone, avatar, coverImage } =
    req.body;

  // Basic validation
  if (!fullname || !email || !username || !password || !role) {
    throw new ApiError(
      400,
      "All required fields (fullname, email, username, password, role) must be provided"
    );
  }

  // Validate allowed public roles
  const allowedRoles = ["student", "recruiter"];
  if (!allowedRoles.includes(role.toLowerCase())) {
    throw new ApiError(
      400,
      "Invalid role. You can only register as 'student' or 'recruiter'"
    );
  }

  // Check if username or email already exists
  const existingUser = await User.findOne({
    $or: [
      { username: username.toLowerCase().trim() },
      { email: email.toLowerCase().trim() },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email or username already exists"
    );
  }

  // Determine avatar: use provided avatar URL or default fallback
  const resolvedAvatar =
    avatar?.trim() ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      fullname
    )}`;

  const user = await User.create({
    fullname: fullname.trim(),
    email: email.toLowerCase().trim(),
    username: username.toLowerCase().trim(),
    password,
    role: role.toLowerCase(),
    phone: phone?.trim() || "",
    avatar: resolvedAvatar,
    coverImage: coverImage?.trim() || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed, please try again");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

/**
 * Login user with email/username and password
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const identifier = email || username;

  if (!identifier || !password) {
    throw new ApiError(400, "Username/email and password are required");
  }

  // Find user and explicitly select password field
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase().trim() },
      { username: identifier.toLowerCase().trim() },
    ],
  }).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exist with the provided credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

/**
 * Logout user - invalidate refresh token and clear cookies
 */
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // remove the refresh token field from user document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * Refresh access token using stored refresh token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token: User not found");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is invalid, expired, or already used");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Access token refreshed successfully"
      )
    );
});

/**
 * Get details of currently logged-in user
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
