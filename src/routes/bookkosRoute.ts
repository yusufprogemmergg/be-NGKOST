import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
} from "../controllers/bookkosController";

const router = Router();

router.post("/", createBooking); // buat booking
router.get("/user/:userId", getUserBookings); // riwayat user
router.get("/owner/:ownerId", getOwnerBookings); // riwayat owner kos
router.patch("/:bookingId/status", updateBookingStatus); // update status

export default router;
