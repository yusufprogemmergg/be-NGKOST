"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/callback', authController_1.oauthcallback);
router.get('/me', authmiddleware_1.verifyToken, authController_1.getMe);
console.log("✅ userRoute loaded");
router.post("/register-owner", authmiddleware_1.verifyToken, (req, res) => {
    console.log("🔥 Route register-owner hit");
    res.send("OK");
});
exports.default = router;
