import multer from "multer";

// Gunakan memory storage karena kita akan langsung upload ke Supabase (tidak simpan di disk lokal)
const storage = multer.memoryStorage();

// Filter file supaya hanya menerima gambar
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Batas ukuran 5 MB per file
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

