"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookkosController_1 = require("../controllers/bookkosController");
const rolemiddleware_1 = require("../middleware/rolemiddleware");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = (0, express_1.Router)();
router.post("/", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["user"]), bookkosController_1.createBooking); // buat booking
router.get("/user/:userId", authmiddleware_1.verifyToken, bookkosController_1.getUserBookings); // riwayat user
router.get("/owner/:ownerId", authmiddleware_1.verifyToken, bookkosController_1.getOwnerBookings); // riwayat owner kos
router.patch("/:bookingId/status", authmiddleware_1.verifyToken, bookkosController_1.updateBookingStatus); // update status
router.patch("/:bookingId/cancel", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["user"]), bookkosController_1.deleteBooking); // cancel booking
router.get("/:bookingId/print", authmiddleware_1.verifyToken, (0, rolemiddleware_1.checkRole)(["user"]), bookkosController_1.printBookingPDF); // cancel booking
exports.default = router;
