import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    console.log("🔑 JWT user:", (req as any).user);
    console.log("🔑 userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: notifications });
  } catch (error: any) {
    console.error("Error getNotifications:", error);
    res.status(500).json({ error: "Gagal mengambil notifikasi" });
  }
};




export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.notification.update({
    where: { id: Number(id) },
    data: { isRead: true },
  });
  res.json({ message: "Notifikasi ditandai sudah dibaca" });
};

