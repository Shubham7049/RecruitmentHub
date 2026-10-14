import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

/**
 * Get notifications for the authenticated user
 * Supports simple pagination and unread counts
 * Route: GET /api/v1/notifications or GET /api/v1/notifications/my
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Build query scoped strictly to authenticated user
  const filter = { userId };

  // Optional filter by read status if explicitly specified in query
  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === "true";
  }

  const [notifications, totalNotifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  const totalPages = Math.ceil(totalNotifications / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages,
          totalNotifications,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Notifications fetched successfully"
    )
  );
});

/**
 * Mark a specific notification as read
 * Route: PATCH /api/v1/notifications/:id/read
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  const userId = req.user?._id.toString();

  // Strict ownership check: User can only mark their own notification as read
  if (notification.userId.toString() !== userId) {
    throw new ApiError(
      403,
      "Access denied: You cannot modify notifications belonging to another user"
    );
  }

  notification.isRead = true;
  await notification.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification marked as read successfully"
      )
    );
});

/**
 * Mark all unread notifications of the authenticated user as read
 * Route: PATCH /api/v1/notifications/read-all
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        modifiedCount: result.modifiedCount,
      },
      `Successfully marked ${result.modifiedCount} notifications as read`
    )
  );
});

/**
 * Delete a specific notification belonging to the authenticated user
 * Route: DELETE /api/v1/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  const userId = req.user?._id.toString();

  // Strict ownership check: User can only delete their own notification
  if (notification.userId.toString() !== userId) {
    throw new ApiError(
      403,
      "Access denied: You cannot delete notifications belonging to another user"
    );
  }

  await Notification.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});
