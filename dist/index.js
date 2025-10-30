"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const client_1 = require("@prisma/client");
// Import route
const uploadRoute_1 = __importDefault(require("./routes/uploadRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const kosRoute_1 = __importDefault(require("./routes/kosRoute"));
const kamarkosRoute_1 = __importDefault(require("./routes/kamarkosRoute"));
const fasilitasRoute_1 = __importDefault(require("./routes/fasilitasRoute"));
const imageRoute_1 = __importDefault(require("./routes/imageRoute"));
const bookkosRoute_1 = __importDefault(require("./routes/bookkosRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const notifRoute_1 = __importDefault(require("./routes/notifRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // URL frontend Next.js kamu
    credentials: true, // ⬅️ wajib biar cookie/token ikut dikirim
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
const server = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use('/api/auth', userRoute_1.default);
app.use('/api/video', uploadRoute_1.default);
app.use('/api/kos', kosRoute_1.default);
app.use('/api/kamarkos', kamarkosRoute_1.default);
app.use('/api/fasility', fasilitasRoute_1.default);
app.use('/api/images', imageRoute_1.default);
app.use("/api/bookings", bookkosRoute_1.default);
app.use("/api/comments", commentRoute_1.default);
app.use("/api/notifications", notifRoute_1.default);
// Cek role user by email
app.get('/api/auth/check-role', async (req, res) => {
    const { email } = req.query;
    if (!email)
        return res.status(400).json({ error: 'Email diperlukan' });
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Jalankan pakai `server.listen`, bukan `app.listen`
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
