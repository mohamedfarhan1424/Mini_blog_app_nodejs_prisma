import { Request, Response } from "express";
import prisma from "../../config/dbConnect";

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Permissions fetched successfully",
      permissions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
