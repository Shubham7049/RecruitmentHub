import { Router } from "express";
import {
  saveJob,
  unsaveJob,
  getMySavedJobs,
  checkIsJobSaved,
} from "../controllers/savedJob.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All saved job routes require authentication
router.use(verifyJWT);

// Static subpaths declared before parameterized /:jobId
router.route("/").get(getMySavedJobs);
router.route("/my").get(getMySavedJobs);
router.route("/check/:jobId").get(checkIsJobSaved);

// Parameterized item routes (save & unsave)
router.route("/:jobId").post(saveJob).delete(unsaveJob);

export default router;
