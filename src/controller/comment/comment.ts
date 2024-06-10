import { Request, Response } from "express";
import prisma from "../../config/dbConnect";
import { PostStatus } from "../../types/post";

export const addComment = async (req: Request, res: Response) => {
  try {
    const { postId, comment }: { postId: string; comment: string } = req.body;

    if (!postId || !comment) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      return res.status(404).json({
        status: 404,
        message: "Post not found or not published",
      });
    }

    const jwtData = req.body.jwtData;

    const newComment = await prisma.comment.create({
      data: {
        content: comment,
        post: {
          connect: {
            id: Number(postId),
          },
        },
        user: {
          connect: {
            id: jwtData.userData.id,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const getCommentsOfPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const comments = await prisma.comment.findMany({
      where: {
        post_id: Number(postId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;

    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
      },
      include: {
        post: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({
        status: 404,
        message: "Comment not found",
      });
    }

    const jwtData = req.body.jwtData.userData;

    if (comment.user_id !== jwtData.id || comment.post.user_id !== jwtData.id) {
      return res.status(403).json({
        status: 403,
        message: "You are not authorized to delete this comment",
      });
    }

    await prisma.comment.delete({
      where: {
        id: Number(commentId),
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
