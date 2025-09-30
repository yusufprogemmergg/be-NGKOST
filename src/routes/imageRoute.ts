// src/routes/image.routes.ts
import express from 'express';
import {
  uploadKosImages,
  listKosImages,
  deleteKosImage,
  setMainKosImage,
  uploadKamarKosImages,
  listKamarImages,
  deleteKamarImage,
  setMainKamarImage
} from '../controllers/imageController';

import { authenticate, requireOwner } from '../middleware/authmiddleware';
import { ensureKosOwner, ensureKamarOwner } from '../middleware/ownership.middleware';
import { upload } from '../middleware/upload';

const router = express.Router();

/* Kos images */
// upload (owner only, and ensure owner of kos)
router.post('/kos/:kosId', authenticate, requireOwner(), ensureKosOwner, upload.array("images", 10), uploadKosImages);
router.get('/kos/:kosId', listKosImages);
router.put('/kos/main/:id', authenticate, requireOwner(), setMainKosImage); // id = kosImage id
router.delete('/kos/:id', authenticate, requireOwner(), deleteKosImage);

/* Kamar images */
router.post('/kamar/:kamarKosId', authenticate, requireOwner(), ensureKamarOwner, upload.array("images", 10), uploadKamarKosImages);
router.get('/kamar/:kamarKosId', listKamarImages);
router.put('/kamar/main/:id', authenticate, requireOwner(), setMainKamarImage);
router.delete('/kamar/:id', authenticate, requireOwner(), deleteKamarImage);

export default router;
