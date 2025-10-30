"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/fasilitas.routes.ts
const express_1 = require("express");
const fasilitasController_1 = require("../controllers/fasilitasController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const router = (0, express_1.Router)();
router.post("/kos/:kosId", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), fasilitasController_1.createFasilitasUmum);
router.get("/kos/:kosId/fasilitas", fasilitasController_1.getFasilitasUmum);
router.put("/kos/fasilitas/:id", authmiddleware_1.verifyToken, fasilitasController_1.updateFasilitasUmum);
router.delete("/kos/fasilitas/:id", authmiddleware_1.verifyToken, fasilitasController_1.deleteFasilitasUmum);
router.post("/:kamarKosId/fasilitas", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), fasilitasController_1.createFasilitas);
router.get("/:kamarKosId/fasilitas", fasilitasController_1.getFasilitas);
router.put("/fasilitas/:id", authmiddleware_1.verifyToken, fasilitasController_1.updateFasilitas);
router.delete("/fasilitas/:id", authmiddleware_1.verifyToken, fasilitasController_1.deleteFasilitas);
exports.default = router;
