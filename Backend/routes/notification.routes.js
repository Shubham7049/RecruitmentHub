import { Router } from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All notification endpoints require authenticated session
router.use(verifyJWT);

// Static paths defined before parameterized wildcards
router.route("/").get(getMyNotifications);
router.route("/my").get(getMyNotifications);
router.route("/read-all").patch(markAllNotificationsAsRead);

// Parameterized item-level paths
router.route("/:id/read").patch(markNotificationAsRead);
router.route("/:id").delete(deleteNotification);

export default router;
