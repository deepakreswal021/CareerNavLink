import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

import {
  changeApplicationStatusAccepted,
  changeApplicationStatusRejected,
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.get("/employer/statusAccept/:id",isAuthenticated,changeApplicationStatusAccepted);
router.get("/employer/statusReject/:id",isAuthenticated,changeApplicationStatusRejected);


export default router;
