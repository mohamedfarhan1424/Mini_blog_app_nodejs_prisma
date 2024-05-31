import { Request, Response } from "express";
import { PostStatus } from "../../types/post";
import prisma from "../../config/dbConnect";

export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      body,
      user_id,
      categories,
    }: {
      title: string;
      body: string;
      user_id: number;
      categories: number[];
    } = req.body;

    if (!title || !body || !user_id || !categories) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const categoriesExist = await prisma.category.findMany({
      where: { id: { in: categories } },
    });

    if (categoriesExist.length !== categories.length) {
      return res
        .status(400)
        .json({ status: 400, message: "Some categories do not exist!" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        body,
        user_id,
        status: PostStatus.DRAFT,
        likesCount: 0,
        disLikesCount: 0,
        categories: {
          connect: categories.map((category_id) => ({ id: category_id })),
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Post created successfully",
      post: post,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const jwtUserId = req.body.jwtData.id;

    const {
      title,
      body,
      user_id,
      categories,
    }: {
      id: number;
      title: string;
      body: string;
      user_id: number;
      categories: number[];
    } = req.body;

    if (jwtUserId !== user_id) {
      return res
        .status(403)
        .json({ status: 403, message: "You are not authorized to do this!" });
    }

    if (!postId || !title || !body || !user_id || !categories) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const existingCategories = await prisma.post.findUnique({
      where: { id: Number(postId) },
      select: { categories: { select: { id: true } } },
    });

    const existingCategoryIds = existingCategories?.categories.map(
      (category) => category.id
    );

    const categoriesToAdd = categories.filter(
      (category_id) => !existingCategoryIds?.includes(category_id)
    );

    const categoriesToRemove = existingCategoryIds?.filter(
      (category_id) => !categories.includes(category_id)
    );

    const post = await prisma.post.update({
      where: { id: Number(postId) },
      data: {
        title,
        body,
        user_id,
        categories: {
          connect: categoriesToAdd.map((category_id) => ({ id: category_id })),
          disconnect: categoriesToRemove?.map((category_id) => ({
            id: category_id,
          })),
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Post updated successfully",
      post: post,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

// export const updatePostStatus = async (req: Request, res: Response) => {
//   try {
//     const postId = req.params.id;
//     const jwtUserId = req.body.jwtData.id;

//     const { status }: { status: PostStatus } = req.body;

//     if (!postId || !status) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Please provide all the fields!" });
//     }

//     const post = await prisma.post.findUnique({
//       where: { id: Number(postId) },
//     });

//     if (!post) {
//       return res.status(404).json({ status: 404, message: "Post not found!" });
//     }

//     if (jwtUserId !== post.user_id) {
//       return res
//         .status(403)
//         .json({ status: 403, message: "You are not authorized to do this!" });
//     }

//     if (status === PostStatus.PUBLISHED) {
//       return res.status(400).json({
//         status: 400,
//         message: "You cannot publish a post directly! Please submit for review",
//       });
//     }

//     if (status === PostStatus.ARCHIVED) {
//       return res.status(400).json({
//         status: 400,
//         message: "You cannot archive a post directly! Please submit for review",
//       });
//     }

//     const updatedPost = await prisma.post.update({
//       where: { id: Number(postId) },
//       data: { status },
//     });

//     return res.status(200).json({
//       status: 200,
//       message: "Post status updated successfully",
//       post: updatedPost,
//     });
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(500)
//       .json({ status: 500, message: "Something went wrong!" });
//   }
// };
