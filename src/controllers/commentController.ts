import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * User buat komentar di kos
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const { kosId, userId, content } = req.body;

    // pastikan user ada
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "user") {
      return res.status(403).json({ message: "Hanya user yang bisa komentar" });
    }

    const comment = await prisma.comment.create({
      data: { kosId, userId, content },
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Owner membalas komentar
 */
export const replyComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { ownerId, reply } = req.body;

    // pastikan owner
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "owner") {
      return res.status(403).json({ message: "Hanya owner yang bisa membalas komentar" });
    }

    // cek apakah komentar milik kos yang dimiliki owner
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: { kos: true },
    });

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });
    if (comment.kos.userId !== owner.id) {
      return res.status(403).json({ message: "Anda bukan pemilik kos ini" });
    }

    const updated = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { reply },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Ambil semua komentar kos
 */
export const getKosComments = async (req: Request, res: Response) => {
  try {
    const { kosId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { kosId: Number(kosId) },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single comment by ID
 */
export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: {
        user: { select: { id: true, name: true } },
        kos: { select: { id: true, name: true } },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update komentar (hanya oleh user pemilik komentar & jika belum dibalas owner)
 */
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: "Anda tidak bisa mengedit komentar orang lain" });
    }

    if (comment.reply) {
      return res.status(400).json({ message: "Komentar sudah dibalas owner, tidak bisa diubah" });
    }

    const updated = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete komentar (oleh user pemilik atau owner kos)
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { requesterId } = req.body;

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: { kos: true },
    });

    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    // validasi: hanya user yang buat atau owner kos
    if (requester.role === "user" && comment.userId !== requester.id) {
      return res.status(403).json({ message: "Anda tidak berhak menghapus komentar ini" });
    }

    if (requester.role === "owner" && comment.kos.userId !== requester.id) {
      return res.status(403).json({ message: "Anda bukan pemilik kos komentar ini" });
    }

    await prisma.comment.delete({ where: { id: Number(commentId) } });

    res.json({ message: "Komentar berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
