import { NextFunction, Request, Response } from "express";
import { PermissionType } from "../types/permission";
import prisma from "../config/dbConnect";

export const validatePermission =
  (permission: PermissionType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body.jwtData.userData;
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
        include: {
          roles: {
            select: {
              permissions: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
      }

      const userPermissions = user.roles.reduce((acc: string[], role) => {
        return [
          ...acc,
          ...role.permissions.map((permission) => permission.name),
        ];
      }, []);

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          status: 403,
          message: "You don't have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
      });
    }
  };
