import { Request, Response } from "express";
import prisma from "../../config/dbConnect";
import { excludeFieldsFromDb } from "../../common/prismaHelper";

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const returnUser = excludeFieldsFromDb(user, [
      "password",
      "created_at",
      "updated_at",
    ]);

    return res.status(200).json({
      status: 200,
      message: "User fetched successfully",
      userData: returnUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { name, email }: { name: string; email: string } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingEmail && existingEmail.id !== Number(userId)) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists. Please try another one",
      });
    }

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found!" });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        name,
        email,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
