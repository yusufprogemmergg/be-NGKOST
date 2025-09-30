
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Request, Response } from 'express';

// helper: update priceFrom/priceTo berdasarkan kamar yang ada
async function updateKosPriceRange(kosId: number) {
  const prices = await prisma.kamarKos.findMany({
    where: { kosId },
    select: { pricePerMonth: true }
  });

  if (prices.length === 0) {
    await prisma.kos.update({
      where: { id: kosId },
      data: { priceFrom: null, priceTo: null }
    });
    return;
  }

  const values = prices.map(p => p.pricePerMonth);
  const min = Math.min(...values);
  const max = Math.max(...values);

  await prisma.kos.update({
    where: { id: kosId },
    data: { priceFrom: min, priceTo: max }
  });
}

export const createKos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { name, address, description, gender, rules } = req.body

    if (!name || !address || !description || !gender) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    let parsedRules: string[] = []

    if (Array.isArray(rules)) {
      parsedRules = rules
    } else if (typeof rules === "string") {
      try {
        parsedRules = JSON.parse(rules) // kalau string JSON
      } catch {
        parsedRules = [rules] // fallback: string biasa jadi 1 item array
      }
    }

    const kos = await prisma.kos.create({
      data: {
        userId,
        name,
        address,
        description,
        gender,
        rules: parsedRules,
      },
    })

    return res.status(201).json(kos)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Internal server error" })
  }
}



export const getAllKos = async (req: Request, res: Response) => {
  try {
    // pagination & filters (opsional)
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      prisma.kos.findMany({
        skip,
        take: perPage,
        include: {
          images: true,
          rooms: { take: 5 }, // preview rooms
          facilitiesUmum: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.kos.count()
    ]);

    return res.json({ data: items, meta: { total, page, perPage } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKosById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const kos = await prisma.kos.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        images: true,
        facilitiesUmum: true,
        rooms: {
          include: { images: true, facilities: true, comments: true, books: true }
        }
      }
    });
    if (!kos) return res.status(404).json({ message: 'Kos not found' });
    return res.json(kos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateKos = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const kos = await prisma.kos.update({
      where: { id },
      data
    });

    return res.json(kos);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Kos not found' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteKos = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Hapus kos (cascade akan menghapus kamar/fasilitas/gambar jika onDelete: Cascade)
    await prisma.kos.delete({ where: { id } });

    return res.json({ message: 'Kos deleted' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') return res.status(404).json({ message: 'Kos not found' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Export helper (dipakai kamar controller saat menambah/ubah/hapus kamar)
export { updateKosPriceRange };
