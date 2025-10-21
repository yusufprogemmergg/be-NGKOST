import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

/**
 * User buat komentar di kos
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // ambil dari JWT middleware
    const { kosId, rating, content } = req.body;

    console.log("🧠 USER DARI TOKEN:", (req as any).user);

    // Validasi field penting
    if (!kosId || !content) {
      return res.status(400).json({ message: "kosId dan content wajib diisi" });
    }

    // Pastikan user yang login ada dan rolenya "user"
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "user") {
      return res.status(403).json({ message: "Hanya user yang bisa memberi komentar" });
    }

    // Validasi rating (jika diisi)
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating harus antara 1 sampai 5" });
    }

    // Pastikan kos yang dikomentari ada + ambil owner-nya
    const kos = await prisma.kos.findUnique({
      where: { id: kosId },
      select: { id: true, name: true, userId: true },
    });

    if (!kos) {
      return res.status(404).json({ message: "Kos tidak ditemukan" });
    }

    // Buat komentar baru
    const comment = await prisma.comment.create({
      data: {
        kosId,
        userId,
        content,
        rating: rating ?? null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 🔔 Buat notifikasi untuk owner kos
    await prisma.notification.create({
      data: {
        userId: kos.userId, // owner kos
        title: `Komentar baru di ${kos.name}`,
        message: `${comment.user.name} berkomentar: "${comment.content}"`,
        type: "comment",
      },
    });

    // Response ke FE
    return res.status(201).json({
      message: "Komentar berhasil ditambahkan",
      data: comment,
    });
  } catch (error: any) {
    console.error("❌ Error createComment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * Owner membalas komentar
 */
export const replyComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { ownerId, reply } = req.body;

    // Pastikan owner valid
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "owner") {
      return res.status(403).json({ message: "Hanya owner yang bisa membalas komentar" });
    }

    // Cek komentar dan relasi kos
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: { kos: true, user: true }, // ambil data user & kos
    });

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });
    if (comment.kos.userId !== owner.id) {
      return res.status(403).json({ message: "Anda bukan pemilik kos ini" });
    }

    // Simpan balasan
    const updated = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { reply },
      include: { user: true, kos: true },
    });

    // 🔔 Kirim notifikasi ke user yang memberi komentar
    await prisma.notification.create({
      data: {
        userId: comment.user.id, // kirim ke user yang memberi komentar
        title: `Balasan dari pemilik kos ${comment.kos.name}`,
        message: `Owner membalas komentarmu: "${reply}"`,
        type: "reply",
      },
    });

    res.json({
      message: "Balasan berhasil dikirim",
      updated,
    });
  } catch (error: any) {
    console.error("❌ Error balas komentar:", error);
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
