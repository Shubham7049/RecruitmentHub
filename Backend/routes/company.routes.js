import { Router } from "express";
import {
  createCompany,
  getMyCompanies,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// All company routes require authentication
router.use(verifyJWT);

// Recruiter-specific routes (must be declared before parameterized /:id route)
router
  .route("/my")
  .get(authorizeRoles("recruiter"), getMyCompanies);

// General collection routes
router
  .route("/")
  .post(authorizeRoles("recruiter"), createCompany)
  .get(getAllCompanies);

// Parameterized item routes
router
  .route("/:id")
  .get(getCompanyById)
  .patch(authorizeRoles("recruiter"), updateCompany)
  .put(authorizeRoles("recruiter"), updateCompany)
  .delete(authorizeRoles("recruiter", "admin"), deleteCompany);

export default router;
