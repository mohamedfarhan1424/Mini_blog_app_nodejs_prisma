import prisma from "../config/dbConnect";
import { SUPER_ADMIN_ROLE_NAME } from "./seedRole";
import bcrypt from "bcrypt";

const userData = {
  email: "admin@blogapp.com",
  password: "password",
  name: "Admin",
};

export const seedUser = async () => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });

    const existingRole = await prisma.role.findFirst({
      where: {
        name: SUPER_ADMIN_ROLE_NAME,
      },
    });

    if (!existingRole) {
      throw new Error("Role not found");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    if (existingUser) {
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roles: {
            connect: {
              id: existingRole.id,
            },
          },
        },
      });
      return;
    }

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        roles: {
          connect: {
            id: existingRole.id,
          },
        },
      },
    });

    console.log("User seeded successfully");
  } catch (error) {
    console.log(error);
    throw new Error("Error seeding user" + error);
  }
};
