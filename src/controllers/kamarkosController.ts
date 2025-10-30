// controllers/kamarKos.controller.ts
import { Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import { updateKosPriceRange } from './kosController';

export const createKamarKos = async (req: Request, res: Response) => {
  try {
    const { kosId, name, totalRooms, available, pricePerMonth } = req.body;

    if (!kosId || !name || pricePerMonth == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // pastikan kos ada
    const kos = await prisma.kos.findUnique({ where: { id: Number(kosId) } });
    if (!kos) return res.status(404).json({ message: 'Kos not found' });

    const kamar = await prisma.kamarKos.create({
      data: {
        kosId: Number(kosId),
        name,
        totalRooms: totalRooms ?? 1,
        available: available ?? totalRooms ?? 1,
        pricePerMonth: Number(pricePerMonth),
      }
    });

    // update price range di Kos
    await updateKosPriceRange(Number(kosId));

    return res.status(201).json(kamar);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllKamarKos = async (req: Request, res: Response) => {
  try {
    const { kosId } = req.query;
    const where = kosId ? { kosId: Number(kosId) } : undefined;

    const rooms = await prisma.kamarKos.findMany({
      where,
      include: { images: true, facilities: true}
    });

    return res.json(rooms);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKamarKosById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
        const kamar = await prisma.kamarKos.findUnique({
      where: { id: Number(id) },
      include: {
        kos: {
          include: {
            facilitiesUmum: true,
          },
        },
        images: true,
        facilities: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    if (!kamar) return res.status(404).json({ message: 'Kamar not found' });
    return res.json(kamar);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateKamarKos = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const kamar = await prisma.kamarKos.update({
      where: { id },
      data
    });

    // update price range di Kos
    if (kamar.kosId) await updateKosPriceRange(kamar.kosId);

    return res.json(kamar);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Kamar not found' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteKamarKos = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // ambil sebelum hapus untuk dapatkan kosId
    const kamarBefore = await prisma.kamarKos.findUnique({ where: { id } });
    if (!kamarBefore) return res.status(404).json({ message: 'Kamar not found' });

    await prisma.kamarKos.delete({ where: { id } });

    await updateKosPriceRange(kamarBefore.kosId);

    return res.json({ message: 'Kamar deleted' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Kamar not found' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKamarKosStatsByOwner = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.id; // ambil dari verifyToken middleware

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized - owner not found in token" });
    }

    // Ambil semua kos milik owner
    const kosList = await prisma.kos.findMany({
      where: { userId: Number(ownerId) }, // sesuaikan nama field
      select: { id: true },
    });

    if (kosList.length === 0) {
      return res.status(404).json({ message: "Owner does not have any kos" });
    }

    const kosIds = kosList.map(k => k.id);

    // Ambil semua kamar dari kos-kos tersebut
    const kamarList = await prisma.kamarKos.findMany({
      where: { kosId: { in: kosIds } },
      select: { totalRooms: true, available: true },
    });

    if (kamarList.length === 0) {
      return res.status(404).json({ message: "No rooms found for owner's kos" });
    }

    // Hitung total kamar, tersedia, terisi
    const totalRooms = kamarList.reduce((acc, k) => acc + (k.totalRooms ?? 0), 0);
    const availableRooms = kamarList.reduce((acc, k) => acc + (k.available ?? 0), 0);
    const occupiedRooms = totalRooms - availableRooms;

    return res.json({
      ownerId,
      totalRooms,
      availableRooms,
      occupiedRooms,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



