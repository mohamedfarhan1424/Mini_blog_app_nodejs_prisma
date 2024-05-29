import { Request, Response } from "express";
import prisma from "../../config/dbConnect";
import { createToken } from "../../common/JwtUtil";

import bcrypt from "bcrypt";
import {
  ACCESS_TOKEN_EXPIRE,
  REFRESH_TOKEN_EXPIRE,
} from "../../config/envConstants";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    } = req.body;

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(400).json({
        status: 400,
        message: "User already exists",
      });
    }

    const encryptedPassword: string = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
      },
    });

    const jwtData = {
      id: user.id,
      email: user.email,
    };

    const accessToken = createToken(jwtData, ACCESS_TOKEN_EXPIRE);
    const refreshToken = createToken(jwtData, REFRESH_TOKEN_EXPIRE);

    return res.status(200).json({
      status: 200,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      userData: jwtData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const jwtData = {
      id: user.id,
      email: user.email,
    };

    const accessToken = createToken(jwtData, ACCESS_TOKEN_EXPIRE);
    const refreshToken = createToken(jwtData, REFRESH_TOKEN_EXPIRE);

    return res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      userData: jwtData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
