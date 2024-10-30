import { Request, Response, NextFunction } from "express";
import jwtService from "../utils/jwt";

export interface RequestWithUser extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : undefined;

  if (!token) {
    res.status(401).json({ message: "Authorization token is missing" });
    return;
  }

  try {
    await jwtService.verifyToken(token);
    const decoded = await jwtService.decodeToken(token);

    if (!decoded) {
      res.status(401).json({ message: "Authorization token is invalid" });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    console.log(error.message);
    res
      .status(401)
      .json({ message: error.message || "Authorization token is invalid" });
  }
};
