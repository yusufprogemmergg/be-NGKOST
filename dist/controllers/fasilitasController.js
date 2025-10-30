"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFasilitas = exports.updateFasilitas = exports.getFasilitas = exports.createFasilitas = exports.deleteFasilitasUmum = exports.updateFasilitasUmum = exports.getFasilitasUmum = exports.createFasilitasUmum = void 0;
const prisma_1 = require("../lib/prisma");
/* ======== FASILITAS UMUM (KOS) ======== */
const createFasilitasUmum = async (req, res) => {
    try {
        const kosId = Number(req.params.kosId);
        const { name } = req.body;
        const fasilitas = await prisma_1.prisma.fasilitasUmum.create({
            data: { kosId, name }
        });
        res.status(201).json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create fasilitas umum", error });
        console.error("Error creating fasilitas umum:", error);
    }
};
exports.createFasilitasUmum = createFasilitasUmum;
const getFasilitasUmum = async (req, res) => {
    try {
        const kosId = Number(req.params.kosId);
        const fasilitas = await prisma_1.prisma.fasilitasUmum.findMany({ where: { kosId } });
        res.json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get fasilitas umum", error });
    }
};
exports.getFasilitasUmum = getFasilitasUmum;
const updateFasilitasUmum = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;
        const fasilitas = await prisma_1.prisma.fasilitasUmum.update({
            where: { id },
            data: { name }
        });
        res.json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update fasilitas umum", error });
    }
};
exports.updateFasilitasUmum = updateFasilitasUmum;
const deleteFasilitasUmum = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.fasilitasUmum.delete({ where: { id } });
        res.json({ message: "Fasilitas umum deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete fasilitas umum", error });
    }
};
exports.deleteFasilitasUmum = deleteFasilitasUmum;
/* ======== FASILITAS (KAMARKOS) ======== */
const createFasilitas = async (req, res) => {
    try {
        const kamarKosId = Number(req.params.kamarKosId);
        const { name } = req.body;
        const fasilitas = await prisma_1.prisma.fasilitas.create({
            data: { kamarKosId, name }
        });
        res.status(201).json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create fasilitas", error });
    }
};
exports.createFasilitas = createFasilitas;
const getFasilitas = async (req, res) => {
    try {
        const kamarKosId = Number(req.params.kamarKosId);
        const fasilitas = await prisma_1.prisma.fasilitas.findMany({ where: { kamarKosId } });
        res.json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get fasilitas", error });
    }
};
exports.getFasilitas = getFasilitas;
const updateFasilitas = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;
        const fasilitas = await prisma_1.prisma.fasilitas.update({
            where: { id },
            data: { name }
        });
        res.json(fasilitas);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update fasilitas", error });
    }
};
exports.updateFasilitas = updateFasilitas;
const deleteFasilitas = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.prisma.fasilitas.delete({ where: { id } });
        res.json({ message: "Fasilitas deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete fasilitas", error });
    }
};
exports.deleteFasilitas = deleteFasilitas;
