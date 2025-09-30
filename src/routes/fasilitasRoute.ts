// routes/fasilitas.routes.ts
import { Router } from "express";
import { authenticate, requireOwner } from "../middleware/authmiddleware";
import { ensureKosOwner, ensureKamarOwner } from "../middleware/ownership.middleware";
import {
  createFasilitasUmum,
  getFasilitasUmum,
  updateFasilitasUmum,
  deleteFasilitasUmum,
  createFasilitas,
  getFasilitas,
  updateFasilitas,
  deleteFasilitas
} from "../controllers/fasilitasController";

const router = Router();

router.post("/kos/:kosId", authenticate, requireOwner(), ensureKosOwner, createFasilitasUmum);
router.get("/kos/:kosId/fasilitas", getFasilitasUmum);
router.put("/kos/fasilitas/:id", authenticate, requireOwner(), updateFasilitasUmum);
router.delete("/kos/fasilitas/:id", authenticate, requireOwner(), deleteFasilitasUmum);

router.post("/:kamarKosId/fasilitas", authenticate, requireOwner(), ensureKamarOwner, createFasilitas);
router.get("/:kamarKosId/fasilitas", getFasilitas);
router.put("/fasilitas/:id", authenticate, requireOwner(), updateFasilitas);
router.delete("/fasilitas/:id", authenticate, requireOwner(), deleteFasilitas);

export default router;
