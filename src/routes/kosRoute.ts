// routes/kos.routes.ts
import express from 'express';
import {
    createKos,
    deleteKos,
    getAllKos,
    getKosById,
    updateKos,
} from '../controllers/kosController';

import { authenticate, requireOwner } from '../middleware/authmiddleware';
import { ensureKosOwner } from '../middleware/ownership.middleware';

const router = express.Router();

router.get('/', getAllKos);
router.get('/:id', getKosById);

// proteksi: hanya owner
router.post('/', authenticate, requireOwner(), createKos);
router.put('/update/:id', authenticate, requireOwner(), ensureKosOwner, updateKos);
router.delete('/:id', authenticate, requireOwner(), ensureKosOwner, deleteKos);

export default router;
