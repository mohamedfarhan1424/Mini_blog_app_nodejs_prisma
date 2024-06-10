import { Request, Response } from "express";
import prisma from "../../config/dbConnect";
import { LikeType } from "../../types/like";

export const likeOrDislikePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const jwtUserId = req.body.jwtData.userData.id;

    const { type }: { type: LikeType } = req.body;

    if (!postId || !type) {
      return res
        .status(400)
        .json({ status: 400, message: "Please provide all the fields!" });
    }

    if (type !== LikeType.LIKE && type !== LikeType.DISLIKE) {
      return res.status(400).json({
        status: 400,
        message: "Invalid type. It should be like or dislike",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found!" });
    }

    await prisma.$transaction(async (prisma) => {
      const existingLike = await prisma.like.findFirst({
        where: { post_id: Number(postId), user_id: jwtUserId },
      });

      if (existingLike) {
        if (existingLike.type === type) {
          await prisma.like.delete({ where: { id: existingLike.id } });

          await prisma.post.update({
            where: { id: Number(postId) },
            data: {
              likesCount: {
                decrement: type === LikeType.LIKE ? 1 : 0,
              },
              disLikesCount: {
                decrement: type === LikeType.DISLIKE ? 1 : 0,
              },
            },
          });

          return res.status(200).json({
            status: 200,
            message: `${type.toUpperCase()} removed successfully`,
          });
        } else {
          await prisma.like.update({
            where: { id: existingLike.id },
            data: { type },
          });

          await prisma.post.update({
            where: { id: Number(postId) },
            data: {
              likesCount: {
                increment: type === LikeType.LIKE ? 1 : -1,
              },
              disLikesCount: {
                increment: type === LikeType.DISLIKE ? 1 : -1,
              },
            },
          });

          return res.status(200).json({
            status: 200,
            message: `${type.toUpperCase()} updated successfully`,
          });
        }
      } else {
        await prisma.like.create({
          data: {
            post_id: Number(postId),
            user_id: jwtUserId,
            type,
          },
        });

        await prisma.post.update({
          where: { id: Number(postId) },
          data: {
            likesCount: {
              increment: type === LikeType.LIKE ? 1 : 0,
            },
            disLikesCount: {
              increment: type === LikeType.DISLIKE ? 1 : 0,
            },
          },
        });

        return res.status(200).json({
          status: 200,
          message: `${type.toUpperCase()} added successfully`,
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong!" });
  }
};
