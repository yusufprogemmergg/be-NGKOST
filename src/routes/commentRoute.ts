import { Router } from "express";
import { createComment, replyComment, getKosComments } from "../controllers/commentController";

const router = Router();

// User komentar
router.post("/", createComment);

// Owner balas komentar
router.patch("/:commentId/reply", replyComment);

// Ambil semua komentar kos
router.get("/kos/:kosId", getKosComments);

export default router;
