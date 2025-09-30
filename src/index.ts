import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Import route (jika sudah ada)
import videoRoutes from './routes/uploadRoute'; // contoh
import userRoutes from './routes/userRoute'; // contoh
import kosRoutes from './routes/kosRoute';
import kamarRoutes from './routes/kamarkosRoute';
import fasilityRoutes from './routes/fasilitasRoute'; // untuk fasilitas kos/kamar
import imageRoutes from './routes/imageRoute'; // untuk upload gambar kos/kamar
import bookingRoutes from "./routes/bookkosRoute";
import commentRoutes from "./routes/commentRoute";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', userRoutes); // rute untuk user (register, login, OAuth)
app.use('/api/video', videoRoutes); // contoh rute upload video
app.use('/api/kos', kosRoutes);
app.use('/api/kamarkos', kamarRoutes);
app.use('/api/fasility', fasilityRoutes); // rute untuk user management
app.use('/api/images', imageRoutes); // rute untuk upload gambar kos/kamar
app.use("/api/bookings", bookingRoutes);
app.use("/api/comments", commentRoutes);
app.get('/api/auth/check-role', async (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email diperlukan' });

  const user = await prisma.user.findUnique({
    where: { email: String(email) },
    select: { role: true },
  });

  res.json({ role: user?.role });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
