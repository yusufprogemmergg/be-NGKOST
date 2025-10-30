"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKos = exports.updateKos = exports.getKosById = exports.getAllKos = exports.createKos = void 0;
exports.updateKosPriceRange = updateKosPriceRange;
const prisma_1 = require("../lib/prisma");
// helper: update priceFrom/priceTo berdasarkan kamar yang ada
async function updateKosPriceRange(kosId) {
    const prices = await prisma_1.prisma.kamarKos.findMany({
        where: { kosId },
        select: { pricePerMonth: true }
    });
    if (prices.length === 0) {
        await prisma_1.prisma.kos.update({
            where: { id: kosId },
            data: { priceFrom: null, priceTo: null }
        });
        return;
    }
    const values = prices.map(p => p.pricePerMonth);
    const min = Math.min(...values);
    const max = Math.max(...values);
    await prisma_1.prisma.kos.update({
        where: { id: kosId },
        data: { priceFrom: min, priceTo: max }
    });
}
const createKos = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, address, description, gender, rules } = req.body;
        if (!name || !address || !description || !gender) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (!userId) {
            return res.status(400).json({ error: "User belum login atau userId tidak ditemukan" });
        }
        // parsing rules (string atau array)
        let parsedRules = [];
        if (Array.isArray(rules)) {
            parsedRules = rules;
        }
        else if (typeof rules === "string") {
            try {
                parsedRules = JSON.parse(rules);
            }
            catch {
                parsedRules = [rules];
            }
        }
        // ✅ cukup pakai owner.connect saja
        const kos = await prisma_1.prisma.kos.create({
            data: {
                name,
                address,
                description,
                gender,
                rules: parsedRules,
                owner: {
                    connect: { id: userId }
                }
            },
        });
        return res.status(201).json(kos);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createKos = createKos;
const getAllKos = async (req, res) => {
    try {
        // pagination & filters (opsional)
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || 10;
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            prisma_1.prisma.kos.findMany({
                skip,
                take: perPage,
                include: {
                    images: true,
                    rooms: { take: 10 }, // preview rooms
                    facilitiesUmum: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.kos.count()
        ]);
        return res.json({ data: items, meta: { total, page, perPage } });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllKos = getAllKos;
const getKosById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const kos = await prisma_1.prisma.kos.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                images: true,
                facilitiesUmum: true,
                rooms: {
                    include: {
                        images: true,
                        facilities: true,
                        books: true,
                    },
                },
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
        if (!kos)
            return res.status(404).json({ message: 'Kos not found' });
        return res.json(kos);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getKosById = getKosById;
const updateKos = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const kos = await prisma_1.prisma.kos.update({
            where: { id },
            data
        });
        return res.json(kos);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2025')
            return res.status(404).json({ message: 'Kos not found' });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateKos = updateKos;
const deleteKos = async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Hapus kos (cascade akan menghapus kamar/fasilitas/gambar jika onDelete: Cascade)
        await prisma_1.prisma.kos.delete({ where: { id } });
        return res.json({ message: 'Kos deleted' });
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2025')
            return res.status(404).json({ message: 'Kos not found' });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteKos = deleteKos;
