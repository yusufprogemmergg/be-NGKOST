"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/image.routes.ts
const express_1 = __importDefault(require("express"));
const imageController_1 = require("../controllers/imageController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
/* Kos images */
// upload (owner only, and ensure owner of kos)
router.post('/kos/:kosId', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), upload_1.upload.array("images", 10), imageController_1.uploadKosImages);
router.get('/kos/:kosId', imageController_1.listKosImages);
router.put('/kos/main/:id', authmiddleware_1.verifyToken, imageController_1.setMainKosImage); // id = kosImage id
router.delete('/kos/:id', authmiddleware_1.verifyToken, imageController_1.deleteKosImage);
/* Kamar images */
router.post('/kamar/:kamarKosId', authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["owner"]), upload_1.upload.array("images", 10), imageController_1.uploadKamarKosImages);
router.get('/kamar/:kamarKosId', imageController_1.listKamarImages);
router.put('/kamar/main/:id', authmiddleware_1.verifyToken, imageController_1.setMainKamarImage);
router.delete('/kamar/:id', authmiddleware_1.verifyToken, imageController_1.deleteKamarImage);
exports.default = router;
