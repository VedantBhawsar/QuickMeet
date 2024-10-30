import { RequestHandler } from "express";
import prismaClient from "../utils/prisma";
import bcryptService from "../utils/bcrypt";
import jwtService from "../utils/jwt";
import { RequestWithUser } from "../middlewares/authMiddleware";
import { User } from "@prisma/client";

export const signupUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existedUser = await prismaClient.user.findFirst({
      where: { email },
    });

    if (existedUser) {
      const token = await jwtService.generateToken(existedUser.id);
      res.status(400).json({ message: "User already exists", token });
      return;
    }

    const hashPassword = await bcryptService.hashPassword(password);

    const newUser = await prismaClient.user.create({
      data: { name, email, password: hashPassword },
    });

    const token = await jwtService.generateToken(newUser.id);

    res.status(201).json({ ...newUser, token });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prismaClient.user.findFirst({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isPasswordCorrect = await bcryptService.comparePassword(
      password,
      user.password
    );

    console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const token = await jwtService.generateToken(user.id);

    res.status(200).json({ ...user, token });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUser: RequestHandler = async (req: RequestWithUser, res) => {
  try {
    const userId = req?.userId;
    const user = await prismaClient.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      res.status(401).json({ message: "User not found" });
    }
    res.status(200).json({
      name: user?.name,
      email: user?.email,
      id: user?.id,
      createdAt: user?.createdAt,
    });
    return;
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
