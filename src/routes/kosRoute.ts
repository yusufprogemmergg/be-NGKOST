// routes/kos.routes.ts
import express from 'express';
import {
    createKos,
    deleteKos,
    getAllKos,
    getKosById,
    updateKos
} from '../controllers/kosController';

import { verifyToken} from '../middleware/authmiddleware';
import { checkRole } from '../middleware/rolemiddleware';

const router = express.Router();

router.get('/', getAllKos);
router.get('/:id', getKosById);

// proteksi: hanya owner
router.post('/', verifyToken,checkRole(["owner"]), createKos);
router.put('/update/:id', verifyToken, checkRole(["owner"]), updateKos);
router.delete('/:id', verifyToken, checkRole(["owner"]), deleteKos);

export default router;
