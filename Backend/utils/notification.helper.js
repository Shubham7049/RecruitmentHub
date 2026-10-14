import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";

/**
 * Reusable helper to create a system notification for a specific user
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.userId - Target recipient user ID
 * @param {string} params.message - Notification message content
 * @returns {Promise<Object|null>} Created notification document or null if failed
 */
export const createNotification = async ({ userId, message }) => {
  try {
    if (!userId || !mongoose.isValidObjectId(userId)) {
      console.warn("[NotificationHelper] Invalid or missing userId provided");
      return null;
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      console.warn("[NotificationHelper] Empty message provided for notification");
      return null;
    }

    const notification = await Notification.create({
      userId,
      message: message.trim(),
      isRead: false,
    });

    return notification;
  } catch (error) {
    // Log error gracefully to prevent interrupting primary domain transactions
    console.error("[NotificationHelper] Failed to create notification:", error.message);
    return null;
  }
};
