// src/middleware/ownership.middleware.ts
import { Response, NextFunction } from 'express';
import {prisma} from '../lib/prisma';
import { AuthRequest } from './authmiddleware';

export async function ensureKosOwner(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    const kosId = Number(
  req.params.kosId ?? // untuk route: /kos/:kosId
  req.params.id ??    // untuk route: /kos/:id
  req.body.kosId ??
  req.query.kosId
);
    if (!kosId) return res.status(400).json({ message: 'kosId required in params/body/query' });

    const kos = await prisma.kos.findUnique({ where: { id: kosId } });
    if (!kos) return res.status(404).json({ message: 'Kos not found' });

    if (kos.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden: not the owner of this Kos' });

    return next();
  } catch (err) {
    console.error('ensureKosOwner error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function ensureKamarOwner(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const kamarId = Number(
      req.params.kamarKosId ?? // kalau route pakai :kamarKosId
      req.params.id ??         // fallback kalau pakai :id
      req.body.kamarKosId ??   // kalau di body
      req.body.id              // fallback
    );
    if (!kamarId) return res.status(400).json({ message: 'kamar id required in params/body' });

    const kamar = await prisma.kamarKos.findUnique({
      where: { id: kamarId },
      include: { kos: true }
    });

    if (!kamar) return res.status(404).json({ message: 'Kamar not found' });
    if (!kamar.kos) return res.status(500).json({ message: 'Kamar has no kos relation' });
    if (kamar.kos.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden: not the owner of this Kamar/Kos' });

    return next();
  } catch (err) {
    console.error('ensureKamarOwner error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
