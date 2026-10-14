import { Router } from "express";
import {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  getApplicationById,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// All application routes require authentication
router.use(verifyJWT);

// Candidate routes (static subpaths declared before parameterized /:id)
router.route("/my").get(authorizeRoles("student"), getMyApplications);
router.route("/apply/:jobId").post(authorizeRoles("student"), applyForJob);

// Recruiter routes
router
  .route("/job/:jobId")
  .get(authorizeRoles("recruiter"), getApplicantsForJob);

router
  .route("/:id/status")
  .patch(authorizeRoles("recruiter"), updateApplicationStatus);

// Dual-role route (Candidate can view own application, Recruiter can view if they own the job)
router.route("/:id").get(getApplicationById);

export default router;
