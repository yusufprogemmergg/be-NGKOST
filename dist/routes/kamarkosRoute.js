"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/kamarKos.routes.ts
const express_1 = __importDefault(require("express"));
const kamarkosController_1 = require("../controllers/kamarkosController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const router = express_1.default.Router();
// Public reads
router.get('/', kamarkosController_1.getAllKamarKos);
router.get('/:id', kamarkosController_1.getKamarKosById);
// Protected: only owner can create kamar under their kos
router.post('/', authmiddleware_1.verifyToken, kamarkosController_1.createKamarKos);
// update & delete kamar: owner of kos that owns this kamar
router.put('/:id', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), kamarkosController_1.updateKamarKos);
router.delete('/:id', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), kamarkosController_1.deleteKamarKos);
exports.default = router;
