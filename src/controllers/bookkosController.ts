import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create new booking
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { kamarKosId, startDate, endDate, note, userId } = req.body;

    // Cek apakah kamar masih tersedia
    const kamar = await prisma.kamarKos.findUnique({
      where: { id: kamarKosId },
    });

    if (!kamar) {
      return res.status(404).json({ message: "Kamar tidak ditemukan" });
    }

    if (kamar.available <= 0) {
      return res.status(400).json({ message: "Kamar tidak tersedia" });
    }

    const booking = await prisma.book.create({
      data: {
        kamarKosId,
        userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        note,
      },
    });

    // Kurangi jumlah available room
    await prisma.kamarKos.update({
      where: { id: kamarKosId },
      data: {
        available: { decrement: 1 },
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by user (riwayat booking)
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

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
    const { ownerId } = req.params;

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

    // Kalau reject, balikin available room
    if (status === "reject") {
      await prisma.kamarKos.update({
        where: { id: booking.kamarKosId },
        data: {
          available: { increment: 1 },
        },
      });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

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
 * Update booking (ubah tanggal atau catatan, hanya jika status masih pending)
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
      return res.status(400).json({ message: "Booking sudah diproses, tidak bisa diubah" });
    }

    const updatedBooking = await prisma.book.update({
      where: { id: Number(bookingId) },
      data: {
        startDate: startDate ? new Date(startDate) : existingBooking.startDate,
        endDate: endDate ? new Date(endDate) : existingBooking.endDate,
        note: note ?? existingBooking.note,
      },
    });

    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete / Cancel booking
 */
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.book.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    // kalau booking masih pending/accept, balikin available
    if (booking.status === "pending" || booking.status === "accept") {
      await prisma.kamarKos.update({
        where: { id: booking.kamarKosId },
        data: {
          available: { increment: 1 },
        },
      });
    }

    await prisma.book.delete({
      where: { id: Number(bookingId) },
    });

    res.json({ message: "Booking berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
