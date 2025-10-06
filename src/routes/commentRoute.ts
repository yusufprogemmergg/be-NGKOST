import { Router } from "express";
import { createComment, replyComment, getKosComments } from "../controllers/commentController";
import { checkRole } from "../middleware/rolemiddleware";
import { verifyToken } from "../middleware/authmiddleware";


const router = Router();

// User komentar
router.post("/", verifyToken,checkRole(["user"]),createComment);

// Owner balas komentar
router.patch("/:commentId/reply", replyComment,checkRole(["owner"]));

// Ambil semua komentar kos
router.get("/kos/:kosId", getKosComments);

export default router;
