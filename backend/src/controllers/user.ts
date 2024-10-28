import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";
import bcryptService from "../utils/bcrypt";
import jwtService from "../utils/jwt";
import prismaClient from "../utils/prisma";

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existedUser = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = bcryptService.hashPassword(password);

    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });

    const token = await jwtService.generateToken(newUser.id);

    return res.status(201).json({
      ...newUser,
      token,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = bcryptService.comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwtService.generateToken(user.id);

    return res.status(200).json({
      ...user,
      token,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
