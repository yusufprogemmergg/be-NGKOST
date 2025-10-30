"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKamarKos = exports.updateKamarKos = exports.getKamarKosById = exports.getAllKamarKos = exports.createKamarKos = void 0;
const prisma_1 = require("../lib/prisma");
const kosController_1 = require("./kosController");
const createKamarKos = async (req, res) => {
    try {
        const { kosId, name, totalRooms, available, pricePerMonth } = req.body;
        if (!kosId || !name || pricePerMonth == null) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // pastikan kos ada
        const kos = await prisma_1.prisma.kos.findUnique({ where: { id: Number(kosId) } });
        if (!kos)
            return res.status(404).json({ message: 'Kos not found' });
        const kamar = await prisma_1.prisma.kamarKos.create({
            data: {
                kosId: Number(kosId),
                name,
                totalRooms: totalRooms ?? 1,
                available: available ?? totalRooms ?? 1,
                pricePerMonth: Number(pricePerMonth),
            }
        });
        // update price range di Kos
        await (0, kosController_1.updateKosPriceRange)(Number(kosId));
        return res.status(201).json(kamar);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createKamarKos = createKamarKos;
const getAllKamarKos = async (req, res) => {
    try {
        const { kosId } = req.query;
        const where = kosId ? { kosId: Number(kosId) } : undefined;
        const rooms = await prisma_1.prisma.kamarKos.findMany({
            where,
            include: { images: true, facilities: true }
        });
        return res.json(rooms);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllKamarKos = getAllKamarKos;
const getKamarKosById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const kamar = await prisma_1.prisma.kamarKos.findUnique({
            where: { id: Number(id) },
            include: {
                kos: {
                    include: {
                        facilitiesUmum: true,
                    },
                },
                images: true,
                facilities: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        if (!kamar)
            return res.status(404).json({ message: 'Kamar not found' });
        return res.json(kamar);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getKamarKosById = getKamarKosById;
const updateKamarKos = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const kamar = await prisma_1.prisma.kamarKos.update({
            where: { id },
            data
        });
        // update price range di Kos
        if (kamar.kosId)
            await (0, kosController_1.updateKosPriceRange)(kamar.kosId);
        return res.json(kamar);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2025')
            return res.status(404).json({ message: 'Kamar not found' });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateKamarKos = updateKamarKos;
const deleteKamarKos = async (req, res) => {
    try {
        const id = Number(req.params.id);
        // ambil sebelum hapus untuk dapatkan kosId
        const kamarBefore = await prisma_1.prisma.kamarKos.findUnique({ where: { id } });
        if (!kamarBefore)
            return res.status(404).json({ message: 'Kamar not found' });
        await prisma_1.prisma.kamarKos.delete({ where: { id } });
        await (0, kosController_1.updateKosPriceRange)(kamarBefore.kosId);
        return res.json({ message: 'Kamar deleted' });
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2025')
            return res.status(404).json({ message: 'Kamar not found' });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteKamarKos = deleteKamarKos;
