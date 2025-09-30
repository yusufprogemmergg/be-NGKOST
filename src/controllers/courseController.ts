// src/controllers/uploadController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase } from '../lib/supabase';
import { prisma } from '../lib/prisma';

export const uploadVideo = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No video uploaded' });

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`;
    const filePath = `videos/${fileName}`;

    // Upload ke Supabase Storage
    const { error } = await supabase.storage
      .from('video') // Nama bucket
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    // Hapus file sementara
    fs.unlinkSync(file.path);

    if (error) {
      return res.status(500).json({ error: 'Failed to upload to storage', detail: error.message });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/video/${filePath}`;

    // Simpan metadata ke database
    const savedVideo = await prisma.file.create({
      data: {
        name: fileName,
        url: publicUrl,
        mimetype: file.mimetype,
      },
    });

    return res.status(201).json({
      message: 'Video uploaded successfully',
      data: savedVideo,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};
