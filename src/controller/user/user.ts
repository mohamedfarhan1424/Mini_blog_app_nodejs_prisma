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
