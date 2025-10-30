"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Akses ditolak, role tidak sesuai" });
        }
        next();
    };
};
exports.checkRole = checkRole;
