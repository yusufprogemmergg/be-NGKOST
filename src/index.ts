import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Import route
import videoRoutes from './routes/uploadRoute';
import userRoutes from './routes/userRoute';
import kosRoutes from './routes/kosRoute';
import kamarRoutes from './routes/kamarkosRoute';
import fasilityRoutes from './routes/fasilitasRoute';
import imageRoutes from './routes/imageRoute';
import bookingRoutes from "./routes/bookkosRoute";
import commentRoutes from "./routes/commentRoute";
import notifRoutes from "./routes/notifRoute";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // URL frontend Next.js kamu
    credentials: true,               // ⬅️ wajib biar cookie/token ikut dikirim
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const server = app;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/api/auth', userRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/kos', kosRoutes);
app.use('/api/kamarkos', kamarRoutes);
app.use('/api/fasility', fasilityRoutes);
app.use('/api/images', imageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notifRoutes);

// Cek role user by email
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

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Jalankan pakai `server.listen`, bukan `app.listen`
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
