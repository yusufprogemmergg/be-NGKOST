// routes/fasilitas.routes.ts
import { Router } from "express";
import {
  createFasilitas,
  createFasilitasUmum,
  deleteFasilitas,
  deleteFasilitasUmum,
  getFasilitas,
  getFasilitasUmum,
  updateFasilitas,
  updateFasilitasUmum
} from "../controllers/fasilitasController";
import { verifyToken } from "../middleware/authmiddleware";
import { checkRole } from "../middleware/rolemiddleware";
const router = Router();

router.post("/kos/:kosId", verifyToken, checkRole(["owner"]), createFasilitasUmum);
router.get("/kos/:kosId/fasilitas", getFasilitasUmum);
router.put("/kos/fasilitas/:id", verifyToken, updateFasilitasUmum);
router.delete("/kos/fasilitas/:id", verifyToken, deleteFasilitasUmum);

router.post("/:kamarKosId/fasilitas", verifyToken, checkRole(["owner"]), createFasilitas);
router.get("/:kamarKosId/fasilitas", getFasilitas);
router.put("/fasilitas/:id", verifyToken, updateFasilitas);
router.delete("/fasilitas/:id", verifyToken, deleteFasilitas);

export default router;
