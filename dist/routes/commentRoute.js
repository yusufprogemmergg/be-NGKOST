"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentController_1 = require("../controllers/commentController");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = (0, express_1.Router)();
// User komentar
router.post("/", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["user"]), commentController_1.createComment);
// Owner balas komentar
router.patch("/:commentId/reply", commentController_1.replyComment, (0, rolemiddleware_1.checkRole)(["owner"]));
// Ambil semua komentar kos
router.get("/kos/:kosId", commentController_1.getKosComments);
exports.default = router;
