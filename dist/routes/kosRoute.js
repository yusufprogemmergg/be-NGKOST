"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/kos.routes.ts
const express_1 = __importDefault(require("express"));
const kosController_1 = require("../controllers/kosController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const router = express_1.default.Router();
router.get('/', kosController_1.getAllKos);
router.get('/:id', kosController_1.getKosById);
// proteksi: hanya owner
router.post('/', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), kosController_1.createKos);
router.put('/update/:id', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), kosController_1.updateKos);
router.delete('/:id', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), kosController_1.deleteKos);
exports.default = router;
