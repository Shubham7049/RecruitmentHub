import { Router } from "express";
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
} from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All profile operations require authentication
router.use(verifyJWT);

// Profile endpoints
router.route("/").post(createProfile);
router.route("/me").get(getMyProfile).patch(updateMyProfile).put(updateMyProfile);

export default router;
