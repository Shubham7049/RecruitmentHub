import { Router } from "express";
import {
  scheduleInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  cancelInterview,
} from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// All interview routes require authentication
router.use(verifyJWT);

// Static subpaths declared before parameterized /:id
router.route("/my").get(getMyInterviews);
router.route("/").post(authorizeRoles("recruiter"), scheduleInterview);

// Specific cancellation action route
router
  .route("/:id/cancel")
  .patch(authorizeRoles("recruiter", "admin"), cancelInterview);

// Parameterized item routes
router
  .route("/:id")
  .get(getInterviewById)
  .patch(authorizeRoles("recruiter"), updateInterview);

export default router;
