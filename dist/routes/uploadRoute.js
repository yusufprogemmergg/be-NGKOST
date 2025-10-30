"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const courseController_1 = require("../controllers/courseController");
const router = express_1.default.Router();
router.post('/upload-video', upload_1.upload.single('video'), courseController_1.uploadVideo);
exports.default = router;
