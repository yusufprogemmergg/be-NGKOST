import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;


export const register = async (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    // Jika name tidak ada, ambil dari bagian sebelum '@'
    const defaultName = email.split('@')[0];
    const finalName = name || defaultName;

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: finalName,
        phone,
        role,
      }
    });

    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    console.error('Register error:', err); // log ke console
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: 'Register failed', error: errorMessage });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Jika user berasal dari OAuth (tidak memiliki password), tolak login
    if (!user.password) {
      return res.status(400).json({ message: 'Account uses OAuth. Please login with Google/GitHub.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      }
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: 'Login failed', error: errorMessage });
  }
};



export const oauthcallback = async (req: Request, res: Response) => {
  const { provider, oauthId, email, name, phone, role } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: role || 'user', // default jika tidak dikirim
          oauthProvider: provider,
          oauthId: oauthId
        }
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
  token,
  role: user.role,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
  }
});

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: 'OAuth failed', error: errorMessage });
  }
};