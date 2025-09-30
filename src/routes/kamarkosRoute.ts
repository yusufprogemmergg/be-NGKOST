// routes/kamarKos.routes.ts
import express from 'express';
import {
  createKamarKos,
  deleteKamarKos,
  getAllKamarKos,
  getKamarKosById,
  updateKamarKos,
} from '../controllers/kamarkosController';

import { authenticate, requireOwner } from '../middleware/authmiddleware';
import { ensureKamarOwner } from '../middleware/ownership.middleware';

const router = express.Router();

// Public reads
router.get('/', getAllKamarKos);
router.get('/:id', getKamarKosById);

// Protected: only owner can create kamar under their kos
router.post('/', authenticate, requireOwner(), createKamarKos);

// update & delete kamar: owner of kos that owns this kamar
router.put('/:id', authenticate, requireOwner(), ensureKamarOwner, updateKamarKos);
router.delete('/:id', authenticate, requireOwner(), ensureKamarOwner, deleteKamarKos);

export default router;
