import { Request, Response } from "express";
import prisma from "../../config/dbConnect";

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      roleId,
      assign,
    }: {
      userId: number;
      roleId: number;
      assign: boolean;
    } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(400).json({
        status: 400,
        message: "User does not exist",
      });
    }

    const existingRole = await prisma.role.findFirst({
      where: {
        id: roleId,
      },
    });

    if (!existingRole) {
      return res.status(400).json({
        status: 400,
        message: "Role does not exist",
      });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: {
          [assign ? "connect" : "disconnect"]: {
            id: roleId,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: `Role ${
        assign ? "assigned" : "unassigned"
      } to user successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error assigning role to user",
    });
  }
};
