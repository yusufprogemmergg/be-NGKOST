import express from 'express';
import { upload } from '../middleware/upload';
import { uploadVideo } from '../controllers/courseController';

const router = express.Router();

router.post('/upload-video', upload.single('video'), uploadVideo);

export default router;