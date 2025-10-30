"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("../lib/supabase");
const prisma_1 = require("../lib/prisma");
const uploadVideo = async (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: 'No video uploaded' });
    try {
        const fileBuffer = fs_1.default.readFileSync(file.path);
        const ext = path_1.default.extname(file.originalname);
        const fileName = `${Date.now()}${ext}`;
        const filePath = `videos/${fileName}`;
        // Upload ke Supabase Storage
        const { error } = await supabase_1.supabase.storage
            .from('video') // Nama bucket
            .upload(filePath, fileBuffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        // Hapus file sementara
        fs_1.default.unlinkSync(file.path);
        if (error) {
            return res.status(500).json({ error: 'Failed to upload to storage', detail: error.message });
        }
        const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/video/${filePath}`;
        // Simpan metadata ke database
        const savedVideo = await prisma_1.prisma.file.create({
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
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
};
exports.uploadVideo = uploadVideo;
