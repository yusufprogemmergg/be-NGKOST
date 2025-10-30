"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadKamarKosImages = exports.uploadKosImages = void 0;
exports.listKosImages = listKosImages;
exports.setMainKosImage = setMainKosImage;
exports.deleteKosImage = deleteKosImage;
exports.listKamarImages = listKamarImages;
exports.setMainKamarImage = setMainKamarImage;
exports.deleteKamarImage = deleteKamarImage;
const supabase_1 = require("../lib/supabase");
const prisma_1 = require("../lib/prisma");
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const BUCKET = process.env.SUPABASE_BUCKET || 'kos-images';
// helper: buat path file di bucket
function makeFilePath(prefix, originalName) {
    const ext = originalName.split('.').pop();
    const filename = `${(0, uuid_1.v4)()}.${ext || 'bin'}`;
    return `${prefix}/${filename}`; // ex: kos/1/uuid.jpg or kamar/3/uuid.jpg
}
/* ===== Kos Images ===== */
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() }).array("images", 10); // max 10 file
// UPLOAD FOTO KOS
const uploadKosImages = async (req, res) => {
    const kosId = req.params.kosId; // ambil dari URL params
    if (!kosId) {
        return res.status(400).json({ message: "kosId is required" });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    try {
        const files = req.files;
        const uploadedImages = [];
        for (const file of files) {
            const fileName = `kos/${(0, uuid_1.v4)()}-${file.originalname}`;
            const { error: uploadError } = await supabase_1.supabase.storage
                .from(BUCKET)
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });
            if (uploadError)
                throw uploadError;
            const { data } = supabase_1.supabase.storage.from(BUCKET).getPublicUrl(fileName);
            const publicUrl = data.publicUrl;
            const img = await prisma_1.prisma.kosImage.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Failed to upload images", error });
    }
};
exports.uploadKosImages = uploadKosImages;
async function listKosImages(req, res) {
    try {
        const kosId = Number(req.params.kosId ?? req.query.kosId);
        if (!kosId)
            return res.status(400).json({ message: 'kosId required' });
        const images = await prisma_1.prisma.kosImage.findMany({ where: { kosId } });
        // for each image, generate signed url (if bucket private)
        const imagesWithUrl = await Promise.all(images.map(async (img) => {
            // signed URL valid for short time
            const signed = await supabase_1.supabase.storage.from(BUCKET).createSignedUrl(img.file, 60 * 60); // 1 hour
            return {
                ...img,
                url: signed.data?.signedUrl ?? supabase_1.supabase.storage.from(BUCKET).getPublicUrl(img.file).data.publicUrl
            };
        }));
        return res.json(imagesWithUrl);
    }
    catch (err) {
        console.error('listKosImages', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function setMainKosImage(req, res) {
    try {
        const id = Number(req.params.id); // kosImage id
        if (!id)
            return res.status(400).json({ message: 'image id required' });
        const image = await prisma_1.prisma.kosImage.findUnique({ where: { id } });
        if (!image)
            return res.status(404).json({ message: 'Image not found' });
        // unset all isMain for kos
        await prisma_1.prisma.kosImage.updateMany({
            where: { kosId: image.kosId },
            data: { isMain: false }
        });
        // set selected image isMain true
        const updated = await prisma_1.prisma.kosImage.update({
            where: { id },
            data: { isMain: true }
        });
        return res.json({ message: 'Set main', image: updated });
    }
    catch (err) {
        console.error('setMainKosImage', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function deleteKosImage(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'image id required' });
        const image = await prisma_1.prisma.kosImage.findUnique({ where: { id } });
        if (!image)
            return res.status(404).json({ message: 'Image not found' });
        // delete from storage
        const { data, error } = await supabase_1.supabase.storage.from(BUCKET).remove([image.file]);
        if (error) {
            console.error('Supabase remove error', error);
            // tetap lanjut menghapus DB record atau return error? kita return error
            return res.status(500).json({ message: 'Failed to delete from storage', error });
        }
        // delete DB record
        await prisma_1.prisma.kosImage.delete({ where: { id } });
        return res.json({ message: 'Image deleted' });
    }
    catch (err) {
        console.error('deleteKosImage', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
/* ===== KamarKos Images ===== */
const uploadKamarKosImages = async (req, res) => {
    const kamarKosId = Number(req.params.kamarKosId);
    if (!kamarKosId) {
        return res.status(400).json({ message: "kamarKosId is required" });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    try {
        const files = req.files;
        const uploadedImages = [];
        for (const file of files) {
            const fileName = `kamarkos/${(0, uuid_1.v4)()}-${file.originalname}`;
            const { error: uploadError } = await supabase_1.supabase.storage
                .from(BUCKET)
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });
            if (uploadError)
                throw uploadError;
            const { data } = supabase_1.supabase.storage.from(BUCKET).getPublicUrl(fileName);
            const publicUrl = data.publicUrl;
            const img = await prisma_1.prisma.kamarKosImage.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Failed to upload images", error });
    }
};
exports.uploadKamarKosImages = uploadKamarKosImages;
async function listKamarImages(req, res) {
    try {
        const kamarId = Number(req.params.kamarId ?? req.query.kamarId);
        if (!kamarId)
            return res.status(400).json({ message: 'kamarId required' });
        const images = await prisma_1.prisma.kamarKosImage.findMany({ where: { kamarKosId: kamarId } });
        const imagesWithUrl = await Promise.all(images.map(async (img) => {
            const signed = await supabase_1.supabase.storage.from(BUCKET).createSignedUrl(img.file, 60 * 60);
            return {
                ...img,
                url: signed.data?.signedUrl ?? supabase_1.supabase.storage.from(BUCKET).getPublicUrl(img.file).data.publicUrl
            };
        }));
        return res.json(imagesWithUrl);
    }
    catch (err) {
        console.error('listKamarImages', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function setMainKamarImage(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'image id required' });
        const image = await prisma_1.prisma.kamarKosImage.findUnique({ where: { id } });
        if (!image)
            return res.status(404).json({ message: 'Image not found' });
        // unset all isMain for kamar
        await prisma_1.prisma.kamarKosImage.updateMany({
            where: { kamarKosId: image.kamarKosId },
            data: { isMain: false }
        });
        const updated = await prisma_1.prisma.kamarKosImage.update({ where: { id }, data: { isMain: true } });
        return res.json({ message: 'Set main', image: updated });
    }
    catch (err) {
        console.error('setMainKamarImage', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function deleteKamarImage(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ message: 'image id required' });
        const image = await prisma_1.prisma.kamarKosImage.findUnique({ where: { id } });
        if (!image)
            return res.status(404).json({ message: 'Image not found' });
        const { data, error } = await supabase_1.supabase.storage.from(BUCKET).remove([image.file]);
        if (error) {
            console.error('Supabase remove error', error);
            return res.status(500).json({ message: 'Failed to delete from storage', error });
        }
        await prisma_1.prisma.kamarKosImage.delete({ where: { id } });
        return res.json({ message: 'Image deleted' });
    }
    catch (err) {
        console.error('deleteKamarImage', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
