import prisma from "../config/dbConnect";
import { PermissionType } from "../types/permission";

export const seedPermissions = async () => {
  const permissions = Object.values(PermissionType);

  try {
    const existingPermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: permissions,
        },
      },
    });

    if (existingPermissions.length === permissions.length) {
      return;
    }

    const permissionsToCreate = permissions.filter((permission) => {
      return !existingPermissions.some((existingPermission) => {
        return existingPermission.name === permission;
      });
    });

    await prisma.permission.createMany({
      data: permissionsToCreate.map((permission) => ({
        name: permission,
      })),
    });

    console.log("Permissions seeded successfully");
    console.log("Included new permissions: ", permissionsToCreate);
  } catch (error) {
    console.log(error);
    throw new Error("Error seeding permissions" + error);
  }
};
