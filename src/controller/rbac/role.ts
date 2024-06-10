import { Request, Response } from "express";
import prisma from "../../config/dbConnect";

export const createRoleWithPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      permissions,
    }: {
      name: string;
      permissions: number[];
    } = req.body;

    const roleExists = await prisma.role.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (roleExists) {
      return res.status(400).json({
        status: 400,
        message: "Role already exists",
      });
    }

    const existingPermissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissions,
        },
      },
    });

    if (existingPermissions.length !== permissions.length) {
      return res.status(400).json({
        status: 400,
        message: "Some permissions do not exist",
      });
    }

    const role = await prisma.role.create({
      data: {
        name: name,
        permissions: {
          connect: permissions.map((permission) => ({
            id: permission,
          })),
        },
      },
    });

    const updatedRole = await prisma.role.findUnique({
      where: {
        id: role.id,
      },
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
    });

    return res.status(201).json({
      status: 201,
      message: "Role created successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const updateRoleWithPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      roleId,
      name,
      permissions,
    }: {
      roleId: number;
      name: string;
      permissions: number[];
    } = req.body;

    const existingRole = await prisma.role.findFirst({
      where: {
        id: roleId,
      },
      select: {
        id: true,
        permissions: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingRole) {
      return res.status(400).json({
        status: 400,
        message: "Role does not exist",
      });
    }

    const roleWithSameName = await prisma.role.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (roleWithSameName && roleWithSameName.id !== roleId) {
      return res.status(400).json({
        status: 400,
        message: "Role with same name already exists",
      });
    }

    const existingPermissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissions,
        },
      },
    });

    if (existingPermissions.length !== permissions.length) {
      return res.status(400).json({
        status: 400,
        message: "Some permissions do not exist",
      });
    }

    const permissionsToAdd = permissions.filter((permission) => {
      return !existingRole.permissions.some((rolePermission) => {
        return rolePermission.id === permission;
      });
    });

    const permissionToDelete = existingRole.permissions
      .map((rolePermission) => {
        return rolePermission.id;
      })
      .filter((permission) => {
        return !permissions.includes(permission);
      });

    await prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        name: name,
        permissions: {
          connect: permissionsToAdd.map((permission) => ({
            id: permission,
          })),
          disconnect: permissionToDelete.map((permission) => ({
            id: permission,
          })),
        },
      },
    });

    const updatedRole = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
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
    });

    return res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
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
    });

    return res.status(200).json({
      status: 200,
      message: "Roles fetched successfully",
      roles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId;

    const existingRole = await prisma.role.findFirst({
      where: {
        id: Number(roleId),
      },
    });

    if (!existingRole) {
      return res.status(400).json({
        status: 400,
        message: "Role does not exist",
      });
    }

    const userWithRole = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            id: Number(roleId),
          },
        },
      },
    });

    if (userWithRole) {
      return res.status(400).json({
        status: 400,
        message: "Role is assigned to some users",
      });
    }

    await prisma.role.delete({
      where: {
        id: Number(roleId),
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
