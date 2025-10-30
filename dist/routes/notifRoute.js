"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/notificationRoute.ts
const express_1 = __importDefault(require("express"));
const notifController_1 = require("../controllers/notifController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = express_1.default.Router();
router.get("/:userId", authmiddleware_1.verifyToken, notifController_1.getNotifications);
router.put("/read/:id", authmiddleware_1.verifyToken, notifController_1.markAsRead);
exports.default = router;
