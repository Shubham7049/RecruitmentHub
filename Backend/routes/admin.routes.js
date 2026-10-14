import { Router } from "express";
import {
  getPlatformStats,
  getAllUsersAdmin,
  getUserByIdAdmin,
  deleteUserAdmin,
  deleteJobAdmin,
  deleteCompanyAdmin,
  getAllApplicationsAdmin,
  getAllInterviewsAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// All Admin routes require authentication AND the 'admin' role
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

// Platform Statistics
router.route("/stats").get(getPlatformStats);

// User Management & Moderation
router.route("/users").get(getAllUsersAdmin);
router.route("/users/:id").get(getUserByIdAdmin).delete(deleteUserAdmin);

// Platform Moderation: Jobs & Companies
router.route("/jobs/:id").delete(deleteJobAdmin);
router.route("/companies/:id").delete(deleteCompanyAdmin);

// Platform Oversight: Applications & Interviews
router.route("/applications").get(getAllApplicationsAdmin);
router.route("/interviews").get(getAllInterviewsAdmin);

export default router;
