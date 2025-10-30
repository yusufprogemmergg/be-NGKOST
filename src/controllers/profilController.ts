import { Request, Response } from "express";
import { prisma } from "../lib/prisma"; // sesuaikan path dengan project kamu
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const BUCKET = process.env.SUPABASE_BUCKET || "kos-images";

// Middleware multer (1 file saja: photo)
export const upload = multer({ storage: multer.memoryStorage() }).single("photo");

// Tambahkan di route nanti: upload, authenticateToken, addProfile

export const addProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // ambil dari JWT middleware

    const {
      fullName,
      gender,
      birthDate,
      occupation,
      institution,
      cityOrigin,
      status,
      lastEducation,
      emergencyContact,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User belum login" });
    }

    // Cek apakah user sudah punya profile
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile sudah ada" });
    }

    // Upload foto ke Supabase Storage jika ada file
    let photoUrl: string | null = null;
    if (req.file) {
      const file = req.file;
      const fileName = `profile/${uuidv4()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }

    // Simpan data profile ke database
    const profile = await prisma.profile.create({
      data: {
        userId,
        photo: photoUrl,
        fullName,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        occupation,
        institution,
        cityOrigin,
        status,
        lastEducation,
        emergencyContact,
      },
    });

    res.status(201).json({ message: "Profile berhasil dibuat", profile });
  } catch (error: any) {
    console.error("Error addProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};


// READ profile (by userId)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profil tidak ditemukan" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil profil" });
  }
};

// UPDATE profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const data = req.body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });

    res.status(200).json(profile);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Profil tidak ditemukan" });
    }
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};

// DELETE profile
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    await prisma.profile.delete({
      where: { userId },
    });

    res.status(200).json({ message: "Profil berhasil dihapus" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Profil tidak ditemukan" });
    }
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus profil" });
  }
};
