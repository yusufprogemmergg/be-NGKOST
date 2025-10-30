"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log("🔑 JWT user:", req.user);
        console.log("🔑 userId:", userId);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notifications = await prisma.notification.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "desc" },
        });
        res.json({ data: notifications });
    }
    catch (error) {
        console.error("Error getNotifications:", error);
        res.status(500).json({ error: "Gagal mengambil notifikasi" });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    const { id } = req.params;
    await prisma.notification.update({
        where: { id: Number(id) },
        data: { isRead: true },
    });
    res.json({ message: "Notifikasi ditandai sudah dibaca" });
};
exports.markAsRead = markAsRead;
