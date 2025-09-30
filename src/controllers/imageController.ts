// src/controllers/image.controller.ts
import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import {prisma} from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const BUCKET = process.env.SUPABASE_BUCKET || 'kos-images';

// helper: buat path file di bucket
function makeFilePath(prefix: string, originalName: string) {
  const ext = originalName.split('.').pop();
  const filename = `${uuidv4()}.${ext || 'bin'}`;
  return `${prefix}/${filename}`; // ex: kos/1/uuid.jpg or kamar/3/uuid.jpg
}

/* ===== Kos Images ===== */

const upload = multer({ storage: multer.memoryStorage() }).array("images", 10); // max 10 file

// UPLOAD FOTO KOS
export const uploadKosImages = async (req: Request, res: Response) => {
  const kosId = req.params.kosId; // ambil dari URL params

  if (!kosId) {
    return res.status(400).json({ message: "kosId is required" });
  }

  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const uploadedImages = [];

    for (const file of files) {
      const fileName = `kos/${uuidv4()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const img = await prisma.kosImage.create({
        data: {
          kosId: Number(kosId),
          file: publicUrl,
        },
      });

      uploadedImages.push(img);
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload images", error });
  }
};


export async function listKosImages(req: Request, res: Response) {
  try {
    const kosId = Number(req.params.kosId ?? req.query.kosId);
    if (!kosId) return res.status(400).json({ message: 'kosId required' });

    const images = await prisma.kosImage.findMany({ where: { kosId } });

    // for each image, generate signed url (if bucket private)
    const imagesWithUrl = await Promise.all(images.map(async (img) => {
      // signed URL valid for short time
      const signed = await supabase.storage.from(BUCKET).createSignedUrl(img.file, 60 * 60); // 1 hour
      return {
        ...img,
        url: signed.data?.signedUrl ?? supabase.storage.from(BUCKET).getPublicUrl(img.file).data.publicUrl
      };
    }));

    return res.json(imagesWithUrl);
  } catch (err) {
    console.error('listKosImages', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function setMainKosImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id); // kosImage id
    if (!id) return res.status(400).json({ message: 'image id required' });

    const image = await prisma.kosImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // unset all isMain for kos
    await prisma.kosImage.updateMany({
      where: { kosId: image.kosId },
      data: { isMain: false }
    });

    // set selected image isMain true
    const updated = await prisma.kosImage.update({
      where: { id },
      data: { isMain: true }
    });

    return res.json({ message: 'Set main', image: updated });
  } catch (err) {
    console.error('setMainKosImage', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteKosImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'image id required' });

    const image = await prisma.kosImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // delete from storage
    const { data, error } = await supabase.storage.from(BUCKET).remove([image.file]);
    if (error) {
      console.error('Supabase remove error', error);
      // tetap lanjut menghapus DB record atau return error? kita return error
      return res.status(500).json({ message: 'Failed to delete from storage', error });
    }

    // delete DB record
    await prisma.kosImage.delete({ where: { id } });

    return res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('deleteKosImage', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ===== KamarKos Images ===== */

export const uploadKamarKosImages = async (req: Request, res: Response) => {
  const kamarKosId = Number(req.params.kamarKosId);

  if (!kamarKosId) {
    return res.status(400).json({ message: "kamarKosId is required" });
  }

  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const uploadedImages = [];

    for (const file of files) {
      const fileName = `kamarkos/${uuidv4()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const img = await prisma.kamarKosImage.create({
        data: {
          kamarKosId,
          file: publicUrl,
        },
      });

      uploadedImages.push(img);
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload images", error });
  }
};



export async function listKamarImages(req: Request, res: Response) {
  try {
    const kamarId = Number(req.params.kamarId ?? req.query.kamarId);
    if (!kamarId) return res.status(400).json({ message: 'kamarId required' });

    const images = await prisma.kamarKosImage.findMany({ where: { kamarKosId: kamarId } });

    const imagesWithUrl = await Promise.all(images.map(async (img: { id: number; kamarKosId: number; file: string; isMain?: boolean }) => {
      const signed = await supabase.storage.from(BUCKET).createSignedUrl(img.file, 60 * 60);
      return {
        ...img,
        url: signed.data?.signedUrl ?? supabase.storage.from(BUCKET).getPublicUrl(img.file).data.publicUrl
      };
    }));

    return res.json(imagesWithUrl);
  } catch (err) {
    console.error('listKamarImages', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function setMainKamarImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'image id required' });

    const image = await prisma.kamarKosImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // unset all isMain for kamar
    await prisma.kamarKosImage.updateMany({
      where: { kamarKosId: image.kamarKosId },
      data: { isMain: false }
    });

    const updated = await prisma.kamarKosImage.update({ where: { id }, data: { isMain: true } });

    return res.json({ message: 'Set main', image: updated });
  } catch (err) {
    console.error('setMainKamarImage', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteKamarImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'image id required' });

    const image = await prisma.kamarKosImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const { data, error } = await supabase.storage.from(BUCKET).remove([image.file]);
    if (error) {
      console.error('Supabase remove error', error);
      return res.status(500).json({ message: 'Failed to delete from storage', error });
    }

    await prisma.kamarKosImage.delete({ where: { id } });

    return res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('deleteKamarImage', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
