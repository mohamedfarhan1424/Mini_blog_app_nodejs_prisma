import prisma from "../config/dbConnect";
export const SUPER_ADMIN_ROLE_NAME = "super-admin";

export const seedRole = async () => {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
      },
    });

    const permissionsIds = permissions.map((permission) => permission.id);

    const existingRole = await prisma.role.findFirst({
      where: {
        name: SUPER_ADMIN_ROLE_NAME,
      },
      include: {
        permissions: {
          select: {
            id: true,
          },
        },
      },
    });

    if (existingRole) {
      const existingRolePermissions = await existingRole.permissions.map(
        (permission) => permission.id
      );

      const permissionsToAdd = permissionsIds.filter(
        (permissionId) => !existingRolePermissions.includes(permissionId)
      );

      if (permissionsToAdd.length) {
        await prisma.role.update({
          where: {
            id: existingRole.id,
          },
          data: {
            permissions: {
              connect: permissionsToAdd.map((permissionId) => ({
                id: permissionId,
              })),
            },
          },
        });

        console.log("Role updated successfully");
        console.log("Added permissions: ", permissionsToAdd);
      } else {
        console.log("Role already has all permissions");
      }

      return;
    }

    await prisma.role.create({
      data: {
        name: SUPER_ADMIN_ROLE_NAME,
        permissions: {
          connect: permissionsIds.map((id) => ({
            id,
          })),
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error seeding role" + error);
  }
};
