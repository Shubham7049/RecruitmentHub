import { Router } from "express";
import {
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// All job routes require authentication
router.use(verifyJWT);

// Recruiter-specific routes (static /my MUST precede parameterized /:id)
router.route("/my").get(authorizeRoles("recruiter"), getMyJobs);

// General collection routes
router
  .route("/")
  .post(authorizeRoles("recruiter"), createJob)
  .get(getAllJobs);

// Parameterized item routes
router
  .route("/:id")
  .get(getJobById)
  .patch(authorizeRoles("recruiter"), updateJob)
  .put(authorizeRoles("recruiter"), updateJob)
  .delete(authorizeRoles("recruiter", "admin"), deleteJob);

export default router;
