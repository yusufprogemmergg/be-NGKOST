// controllers/fasilitas.controller.ts
import { Request, Response } from "express";
import {prisma} from "../lib/prisma";

/* ======== FASILITAS UMUM (KOS) ======== */
export const createFasilitasUmum = async (req: Request, res: Response) => {
  try {
    const kosId = Number(req.params.kosId);
    const { name } = req.body;

    const fasilitas = await prisma.fasilitasUmum.create({
      data: { kosId, name }
    });

    res.status(201).json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to create fasilitas umum", error });
    console.error("Error creating fasilitas umum:", error);
  }
};

export const getFasilitasUmum = async (req: Request, res: Response) => {
  try {
    const kosId = Number(req.params.kosId);
    const fasilitas = await prisma.fasilitasUmum.findMany({ where: { kosId } });
    res.json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to get fasilitas umum", error });
  }
};

export const updateFasilitasUmum = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    const fasilitas = await prisma.fasilitasUmum.update({
      where: { id },
      data: { name }
    });

    res.json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to update fasilitas umum", error });
  }
};

export const deleteFasilitasUmum = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.fasilitasUmum.delete({ where: { id } });
    res.json({ message: "Fasilitas umum deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete fasilitas umum", error });
  }
};

/* ======== FASILITAS (KAMARKOS) ======== */
export const createFasilitas = async (req: Request, res: Response) => {
  try {
    const kamarKosId = Number(req.params.kamarKosId);
    const { name } = req.body;

    const fasilitas = await prisma.fasilitas.create({
      data: { kamarKosId, name }
    });

    res.status(201).json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to create fasilitas", error });
  }
};

export const getFasilitas = async (req: Request, res: Response) => {
  try {
    const kamarKosId = Number(req.params.kamarKosId);
    const fasilitas = await prisma.fasilitas.findMany({ where: { kamarKosId } });
    res.json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to get fasilitas", error });
  }
};

export const updateFasilitas = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    const fasilitas = await prisma.fasilitas.update({
      where: { id },
      data: { name }
    });

    res.json(fasilitas);
  } catch (error) {
    res.status(500).json({ message: "Failed to update fasilitas", error });
  }
};

export const deleteFasilitas = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.fasilitas.delete({ where: { id } });
    res.json({ message: "Fasilitas deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete fasilitas", error });
  }
};
