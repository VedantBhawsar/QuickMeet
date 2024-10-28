import { Request, Response, NextFunction } from "express";
import jwtService from "../utils/jwt";

interface RequestWithUser extends Request {
  userId: string;
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = await jwtService.decodeToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Authorization token is invalid" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Authorization token is invalid" });
  }
};
