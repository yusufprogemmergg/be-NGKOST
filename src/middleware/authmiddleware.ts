import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: number;
  role: string;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: token missing" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: invalid or expired token" });
  }
};
