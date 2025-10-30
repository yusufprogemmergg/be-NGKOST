// routes/kamarKos.routes.ts
import express from 'express';
import {
  createKamarKos,
  deleteKamarKos,
  getAllKamarKos,
  getKamarKosById,
  updateKamarKos,
  getKamarKosStatsByOwner
} from '../controllers/kamarkosController';

import { verifyToken} from '../middleware/authmiddleware';
import { checkRole } from '../middleware/rolemiddleware';

const router = express.Router();

// Public reads
router.get('/', getAllKamarKos);
router.get('/:id', getKamarKosById);

// Protected: only owner can create kamar under their kos
router.post('/', verifyToken, createKamarKos);

// update & delete kamar: owner of kos that owns this kamar
router.put('/:id', verifyToken, checkRole(["owner"]), updateKamarKos);
router.delete('/:id', verifyToken, checkRole(["owner"]), deleteKamarKos);
router.get('/stats', verifyToken, checkRole(["owner"]), getKamarKosStatsByOwner);

export default router;
