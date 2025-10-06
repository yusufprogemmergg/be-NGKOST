// src/routes/image.routes.ts
import express from 'express';
import {
  deleteKamarImage,
  deleteKosImage,
  listKamarImages,
  listKosImages,
  setMainKamarImage,
  setMainKosImage,
  uploadKamarKosImages,
  uploadKosImages
} from '../controllers/imageController';

import { verifyToken } from '../middleware/authmiddleware';
import { checkRole } from "../middleware/rolemiddleware";
import { upload } from '../middleware/upload';

const router = express.Router();

/* Kos images */
// upload (owner only, and ensure owner of kos)
router.post('/kos/:kosId', verifyToken, checkRole(["owner"]), upload.array("images", 10), uploadKosImages);
router.get('/kos/:kosId', listKosImages);
router.put('/kos/main/:id', verifyToken, setMainKosImage); // id = kosImage id
router.delete('/kos/:id', verifyToken, deleteKosImage);

/* Kamar images */
router.post('/kamar/:kamarKosId', verifyToken, checkRole(["owner"]), upload.array("images", 10), uploadKamarKosImages);
router.get('/kamar/:kamarKosId', listKamarImages);
router.put('/kamar/main/:id', verifyToken, setMainKamarImage);
router.delete('/kamar/:id', verifyToken, deleteKamarImage);

export default router;
