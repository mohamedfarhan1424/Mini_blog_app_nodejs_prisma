import { Request, Response } from "express";
import { PostStatus } from "../../types/post";
import prisma from "../../config/dbConnect";
import { LikeType } from "../../types/like";

export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      body,
      categories,
    }: {
      title: string;
      body: string;
      user_id: number;
      categories: number[];
    } = req.body;

    const user_id = req.body.jwtData.userData.id;

    if (!title || !body || !categories) {
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
    const jwtUserId = req.body.jwtData.userData.id;

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

export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const jwtUserId = req.body.jwtData.userData.id;

    const { status }: { status: PostStatus } = req.body;

    if (!postId || !status) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found!" });
    }

    if (jwtUserId !== post.user_id) {
      return res
        .status(403)
        .json({ status: 403, message: "You are not authorized to do this!" });
    }

    switch (status) {
      case PostStatus.DRAFT:
      case PostStatus.ON_REVIEW:
      case PostStatus.ARCHIVED:
        await prisma.post.update({
          where: { id: Number(postId) },
          data: { status },
        });
        break;
      case PostStatus.PUBLISHED:
        return res.status(400).json({
          status: 400,
          message: "You can not publish the post! Please submit for review.",
        });
      default:
        return res
          .status(400)
          .json({ status: 400, message: "Invalid status provided!" });
    }

    return res.status(200).json({
      status: 200,
      message: "Post status updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const publishPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const jwtUserId = req.body.jwtData.userData.id;

    if (!postId) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found!" });
    }

    if (jwtUserId === post.user_id) {
      return res
        .status(403)
        .json({ status: 403, message: "You can not publish your own post!" });
    }

    if (post.status !== PostStatus.ON_REVIEW) {
      return res.status(400).json({
        status: 400,
        message: "You can not publish the post! Please submit for review.",
      });
    }

    await prisma.post.update({
      where: { id: Number(postId) },
      data: { status: PostStatus.PUBLISHED },
    });

    return res.status(200).json({
      status: 200,
      message: "Post published successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const getPublishedPosts = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? String(req.query.search) : "";

    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        OR: [{ title: { contains: search } }, { body: { contains: search } }],
      },
      orderBy: { created_at: req.query.sort === "asc" ? "asc" : "desc" },
      skip: offset,
      take: limit,
      include: {
        categories: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Published posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: {
        categories: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        likes: {
          include: { user: { select: { id: true, name: true, email: true } } },
          where: { type: LikeType.LIKE },
        },
        comments: {
          select: {
            id: true,
            content: true,
            created_at: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found!" });
    }

    return res.status(200).json({
      status: 200,
      message: "Post fetched successfully",
      post,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const getPostByStatus = async (req: Request, res: Response) => {
  try {
    const status: PostStatus = req.query.status as PostStatus;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = (page - 1) * limit;

    const search = req.query.search ? String(req.query.search) : "";

    const posts = await prisma.post.findMany({
      where: {
        status: status,
        OR: [{ title: { contains: search } }, { body: { contains: search } }],
      },
      orderBy: { created_at: req.query.sort === "asc" ? "asc" : "desc" },
      skip: offset,
      take: limit,
      include: {
        categories: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.body.jwtData.userData.id;

    const posts = await prisma.post.findMany({
      where: { user_id: Number(userId) },
      include: {
        categories: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        likes: {
          include: { user: { select: { id: true, name: true, email: true } } },
          where: { type: LikeType.LIKE },
        },
        comments: {
          select: {
            id: true,
            content: true,
            created_at: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "User posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found!" });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.comment.deleteMany({ where: { post_id: Number(postId) } });
      await prisma.like.deleteMany({ where: { post_id: Number(postId) } });
      await prisma.post.delete({ where: { id: Number(postId) } });
    });

    return res.status(200).json({
      status: 200,
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};
