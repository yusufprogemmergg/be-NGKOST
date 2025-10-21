import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set in environment");

// -------------------- REGISTER --------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email sudah terdaftar" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
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
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat register" });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat login" });
  }
};

// -------------------- OAUTH CALLBACK --------------------

import { PrismaClient, Role } from "@prisma/client";

export const oauthcallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, oauthId, email, name, phone, role } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email tidak ditemukan dari provider" });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: role === "owner" ? Role.owner : Role.user,
          oauthProvider: provider,
          oauthId,
        },
      });
    } else {
      // update kalau oauthId belum diset
      if (!user.oauthId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: provider,
            oauthId,
          },
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user.id,
      role: user.role,
      message: "OAuth login success",
    });

  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ message: "Gagal login dengan OAuth" });
  }
};

// -------------------- GET ME --------------------
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token tidak ditemukan atau tidak valid" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // Cari user berdasarkan ID dari token
    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    console.error("GetMe error:", error);
    res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
};

