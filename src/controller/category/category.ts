import { Request, Response } from "express";
import prisma from "../../config/dbConnect";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name }: { name: string } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      status: 201,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();

    return res.status(200).json({
      status: 200,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const getCategoryWithPosts = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            body: true,
            status: true,
            likesCount: true,
            disLikesCount: true,
            categories: true,
            comments: true,
            likes: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
