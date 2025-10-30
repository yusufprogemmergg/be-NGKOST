import express from "express";
import {
  addProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profilController";
import { verifyToken } from "../middleware/authmiddleware"; // middleware JWT kamu
import { upload } from '../middleware/upload';

const router = express.Router();

router.post("/", verifyToken, upload.single("photo"), addProfile);
router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.delete("/", verifyToken, deleteProfile);

export default router;