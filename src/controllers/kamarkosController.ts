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
      where: { id },
      include: { images: true, facilities: true, books: true, kos: true }
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
