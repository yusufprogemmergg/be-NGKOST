// routes/notificationRoute.ts
import express from "express"
import { getNotifications,markAsRead } from "../controllers/notifController"
import { verifyToken} from '../middleware/authmiddleware';
import { checkRole } from '../middleware/rolemiddleware';

const router = express.Router()

router.get("/:userId",verifyToken, getNotifications)
router.put("/read/:id",verifyToken,markAsRead)

export default router
