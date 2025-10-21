import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  deleteBooking,
  printBookingPDF
} from "../controllers/bookkosController";
import { checkRole } from "../middleware/rolemiddleware";
import { verifyToken } from "../middleware/authmiddleware";

const router = Router();

router.post("/",verifyToken,checkRole(["user"]), createBooking); // buat booking
router.get("/user/:userId",verifyToken, getUserBookings); // riwayat user
router.get("/owner/:ownerId",verifyToken, getOwnerBookings); // riwayat owner kos
router.patch("/:bookingId/status",verifyToken, updateBookingStatus); // update status
router.patch("/:bookingId/cancel",verifyToken, checkRole(["user"]), deleteBooking); // cancel booking
router.get("/:bookingId/print",verifyToken, checkRole(["user"]), printBookingPDF); // cancel booking

export default router;