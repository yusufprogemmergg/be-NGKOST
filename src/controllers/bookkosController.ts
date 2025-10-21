import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"; // gunakan pdf-lib untuk hasil rapi
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { kamarKosId, startDate, endDate, note } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User tidak valid atau belum login" });
    }

    if (!kamarKosId || !startDate || !endDate) {
      return res.status(400).json({ message: "Data booking belum lengkap" });
    }

    // Ambil data kamar
    const kamar = await prisma.kamarKos.findUnique({
      where: { id: Number(kamarKosId) },
      include: { kos: { include: { owner: true } } },
    });

    if (!kamar) return res.status(404).json({ message: "Kamar tidak ditemukan" });
    if (kamar.available <= 0) return res.status(400).json({ message: "Kamar tidak tersedia" });

    // ================== HITUNG TOTAL PRICE ==================
const start = new Date(startDate);
const end = new Date(endDate);

// Hitung total bulan sewa
let diffmonth =
  (end.getFullYear() - start.getFullYear()) * 12 +
  (end.getMonth() - start.getMonth());

// Kalau ada sisa hari lebih dari 0, hitung 1 bulan tambahan
if (end.getDate() > start.getDate()) diffmonth++;

if (diffmonth <= 0) diffmonth = 1; // minimal 1 bulan

const totalPrice = diffmonth * kamar.pricePerMonth;

    // ================== BUAT BOOKING ==================
    const booking = await prisma.book.create({
      data: {
        kamarKosId: Number(kamarKosId),
        userId: Number(userId),
        startDate: start,
        endDate: end,
        totalPrice, // ⬅️ ditambahkan ke database
        note,
      },
      include: {
        user: true,
        kamarKos: { include: { kos: true } },
      },
    });

    // Kurangi jumlah kamar tersedia
    await prisma.kamarKos.update({
      where: { id: Number(kamarKosId) },
      data: { available: { decrement: 1 } },
    });

    // ================== NOTIFIKASI UNTUK OWNER ==================
    const ownerId = kamar.kos?.owner?.id;
    if (ownerId) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          title: `Booking baru untuk ${kamar.kos.name}`,
          message: `${booking.user.name} melakukan booking kamar ${kamar.name}`,
          type: "booking",
        },
      });
    }

    res.status(201).json({
      message: "Booking berhasil dibuat",
      data: booking,
    });
  } catch (error: any) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by user (riwayat booking)
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User tidak valid atau belum login" });
    }

    const bookings = await prisma.book.findMany({
      where: { userId: Number(userId) },
      include: {
        kamarKos: {
          include: { kos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by kos owner
 */
export const getOwnerBookings = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.id;

    const bookings = await prisma.book.findMany({
      where: {
        kamarKos: {
          kos: {
            userId: Number(ownerId),
          },
        },
      },
      include: {
        user: true,
        kamarKos: {
          include: { kos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update booking status (accept/reject)
 */
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // accept / reject

    const booking = await prisma.book.update({
      where: { id: Number(bookingId) },
      data: { status },
    });

    // Kalau reject, balikin kamar
    if (status === "reject") {
      await prisma.kamarKos.update({
        where: { id: booking.kamarKosId },
        data: {
          available: { increment: 1 },
        },
      });
    }

    res.json({
      message: `Booking berhasil diperbarui menjadi ${status}`,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all bookings (admin)
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.book.findMany({
      include: {
        user: true,
        kamarKos: {
          include: { kos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.book.findUnique({
      where: { id: Number(bookingId) },
      include: {
        user: true,
        kamarKos: {
          include: { kos: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update booking (ubah tanggal atau catatan, hanya jika pending)
 */
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { startDate, endDate, note } = req.body;

    const existingBooking = await prisma.book.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (existingBooking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Booking sudah diproses, tidak bisa diubah" });
    }

    const updatedBooking = await prisma.book.update({
      where: { id: Number(bookingId) },
      data: {
        startDate: startDate
          ? new Date(startDate)
          : existingBooking.startDate,
        endDate: endDate ? new Date(endDate) : existingBooking.endDate,
        note: note ?? existingBooking.note,
      },
    });

    res.json({
      message: "Booking berhasil diperbarui",
      data: updatedBooking,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.book.findUnique({
      where: { id: Number(bookingId) },
      include: {
        kamarKos: {
          include: { kos: { include: { owner: true } } },
        },
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    // Kembalikan stok kamar jika booking belum expired
    if (booking.status === "pending" || booking.status === "accept") {
      await prisma.kamarKos.update({
        where: { id: booking.kamarKosId },
        data: { available: { increment: 1 } },
      });
    }

    await prisma.book.delete({ where: { id: Number(bookingId) } });

    // Kirim notifikasi ke owner jika perlu
    if (booking.kamarKos.kos?.owner?.id) {
      await prisma.notification.create({
        data: {
          userId: booking.kamarKos.kos.owner.id,
          title: `Booking dibatalkan oleh ${booking.user.name}`,
          message: `Booking kamar ${booking.kamarKos.name} telah dibatalkan.`,
          type: "cancel",
        },
      });
    }

    res.json({ message: "Booking berhasil dibatalkan dan kamar dikembalikan" });
  } catch (error: any) {
    console.error("❌ Delete Booking Error:", error);
    res.status(500).json({ error: error.message });
  }
};


export const printBookingPDF = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.book.findUnique({
      where: { id: Number(bookingId) },
      include: {
        user: true,
        kamarKos: {
          include: {
            kos: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    // ================== GENERATE PDF ==================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 550]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const textColor = rgb(0, 0, 0);
    const teal = rgb(0.1, 0.5, 0.5);
    const gray = rgb(0.6, 0.6, 0.6);

    const drawText = (text: string, x: number, y: number, size = 12, color = textColor) => {
      page.drawText(text, { x, y, size, font, color });
    };

    // ================== HEADER ==================
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width,
      height: 80,
      color: teal,
    });
    drawText("BUKTI PEMESANAN KAMAR", 160, height - 50, 18, rgb(1, 1, 1));

    // ================== INFO BOOKING ==================
    let y = height - 120;

    drawText("Detail Pemesanan", 80, y, 14, teal);
    y -= 10;
    page.drawLine({
      start: { x: 80, y },
      end: { x: width - 80, y },
      thickness: 1,
      color: gray,
    });
    y -= 30;

    drawText(`Nama Penyewa     : ${booking.user.name}`, 80, y); y -= 22;
    drawText(`Email            : ${booking.user.email}`, 80, y); y -= 22;
    drawText(`Nama Kos         : ${booking.kamarKos.kos.name}`, 80, y); y -= 22;
    drawText(`Alamat Kos       : ${booking.kamarKos.kos.address ?? "-"}`, 80, y); y -= 22;
    drawText(`Kamar            : ${booking.kamarKos.name}`, 80, y); y -= 22;
    drawText(`Tanggal Mulai    : ${new Date(booking.startDate).toLocaleDateString("id-ID")}`, 80, y); y -= 22;
    drawText(`Tanggal Selesai  : ${booking.endDate ? new Date(booking.endDate).toLocaleDateString("id-ID") : "-"}`, 80, y); y -= 22;
    drawText(`Total Harga      : Rp ${(booking.totalPrice ?? 0).toLocaleString("id-ID")}`, 80, y); y -= 22;
    drawText(`Status           : ${booking.status.toUpperCase()}`, 80, y); y -= 40;

    // ================== FOOTER ==================
    page.drawLine({
      start: { x: 80, y },
      end: { x: width - 80, y },
      thickness: 1,
      color: gray,
    });
    y -= 30;
    drawText("Terima kasih telah melakukan booking di aplikasi NGKOST.", 80, y, 11, rgb(0.2, 0.2, 0.2));
    drawText(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 80, y - 20, 10, gray);

    // ================== OUTPUT PDF ==================
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bukti-booking-${booking.id}.pdf"`);
    res.end(Buffer.from(pdfBytes)); // gunakan res.end agar tidak corrupt
  } catch (error: any) {
    console.error("❌ Print Booking PDF Error:", error);
    res.status(500).json({ error: error.message });
  }
};


