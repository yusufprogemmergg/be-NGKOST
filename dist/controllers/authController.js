"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeRoleToOwner = exports.getMe = exports.oauthcallback = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET not set in environment");
// -------------------- REGISTER --------------------
const register = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email dan password wajib diisi" });
            return;
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "Email sudah terdaftar" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashed,
                name: name || email.split("@")[0],
                phone,
                role: role || "user",
            },
        });
        res.status(201).json({
            message: "Registrasi berhasil",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat register" });
    }
};
exports.register = register;
// -------------------- LOGIN --------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }
        if (!user.password) {
            res.status(400).json({
                message: "Akun ini menggunakan OAuth, login dengan Google/GitHub",
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Email atau password salah" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            message: "Login berhasil",
            token, // 🔑 kirim token langsung ke FE
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat login" });
    }
};
exports.login = login;
// -------------------- OAUTH CALLBACK --------------------
const client_1 = require("@prisma/client");
const oauthcallback = async (req, res) => {
    try {
        const { provider, oauthId, email, name, phone, role } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email tidak ditemukan dari provider" });
            return;
        }
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    name,
                    phone,
                    role: role === "owner" ? client_1.Role.owner : client_1.Role.user,
                    oauthProvider: provider,
                    oauthId,
                },
            });
        }
        else {
            // update kalau oauthId belum diset
            if (!user.oauthId) {
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        oauthProvider: provider,
                        oauthId,
                    },
                });
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({
            token,
            userId: user.id,
            role: user.role,
            message: "OAuth login success",
        });
    }
    catch (error) {
        console.error("OAuth error:", error);
        res.status(500).json({ message: "Gagal login dengan OAuth" });
    }
};
exports.oauthcallback = oauthcallback;
// -------------------- GET ME --------------------
const getMe = async (req, res) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Token tidak ditemukan atau tidak valid" });
            return;
        }
        const token = authHeader.split(" ")[1];
        // Verifikasi token JWT
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Cari user berdasarkan ID dari token
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                photo: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("GetMe error:", error);
        res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
    }
};
exports.getMe = getMe;
// -------------------- UPGRADE ROLE TO OWNER --------------------
const upgradeRoleToOwner = async (req, res) => {
    try {
        // Ambil token JWT dari header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Token tidak ditemukan atau tidak valid" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.id;
        // Ambil data tambahan dari body
        const { name, phone, email, photo } = req.body;
        // Cari user yang login
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }
        // Cek apakah sudah owner
        if (user.role === "owner") {
            res.status(400).json({ message: "Akun ini sudah menjadi owner" });
            return;
        }
        // Update data user + ubah role jadi owner
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                name: name || user.name,
                phone: phone || user.phone,
                email: email || user.email,
                photo: photo || user.photo || "/images/default-avatar.png",
                role: "owner",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                photo: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            message: "Akun berhasil diupgrade menjadi owner",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Upgrade Role Error:", error);
        res.status(500).json({ message: "Gagal mengubah role user", error: error.message });
    }
};
exports.upgradeRoleToOwner = upgradeRoleToOwner;
