import { Router } from "express";
import {
  loginUser,
  registerUser,
  renewAccessToken,
} from "../controller/auth/auth";
import { getAllUsers, getUser, updateUser } from "../controller/user/user";
import { validateJwtTokenMiddleware } from "../middleware/auth";
import {
  createRoleWithPermissions,
  deleteRole,
  getAllRoles,
  updateRoleWithPermissions,
} from "../controller/rbac/role";
import { assignRoleToUser } from "../controller/rbac/user";
import { validatePermission } from "../middleware/permission";
import { PermissionType } from "../types/permission";
import { getAllPermissions } from "../controller/rbac/permission";
import {
  createCategory,
  getCategories,
  getCategoryWithPosts,
} from "../controller/category/category";
import {
  createPost,
  deletePost,
  getPostById,
  getPostByStatus,
  getPublishedPosts,
  getUserPosts,
  publishPost,
  updatePost,
  updatePostStatus,
} from "../controller/post/post";
import { likeOrDislikePost } from "../controller/like/like";
import {
  addComment,
  deleteComment,
  getCommentsOfPost,
} from "../controller/comment/comment";

const router = Router();

// Hello World
router.route("/").get((req, res) => {
  return res.send("Hello World");
});

// Auth Routes
router.route("/api/register").post(registerUser);
router.route("/api/login").post(loginUser);
router.route("/api/renew-token").post(renewAccessToken);

// Including middleware for upcoming routes
router.use("/api/*", validateJwtTokenMiddleware);

// User Routes
router
  .route("/api/user")
  .get(validatePermission(PermissionType.USER_VIEW), getAllUsers);
router
  .route("/api/user/:userId")
  .get(validatePermission(PermissionType.USER_VIEW), getUser)
  .put(validatePermission(PermissionType.USER_UPDATE), updateUser);

// RBAC Routes
router
  .route("/api/permission")
  .get(validatePermission(PermissionType.PERMISSION_VIEW), getAllPermissions);
router
  .route("/api/role")
  .get(validatePermission(PermissionType.ROLE_VIEW), getAllRoles)
  .post(
    validatePermission(PermissionType.ROLE_CREATE),
    createRoleWithPermissions
  )
  .put(
    validatePermission(PermissionType.ROLE_UPDATE),
    updateRoleWithPermissions
  );
router
  .route("/api/role/:roleId")
  .delete(validatePermission(PermissionType.ROLE_DELETE), deleteRole);
router
  .route("/api/role/user")
  .post(validatePermission(PermissionType.USER_UPDATE), assignRoleToUser);

// category routes
router
  .route("/api/category")
  .get(validatePermission(PermissionType.CATEGORY_VIEW), getCategories)
  .post(validatePermission(PermissionType.CATEGORY_CREATE), createCategory);
router
  .route("/api/category/:id")
  .get(validatePermission(PermissionType.CATEGORY_VIEW), getCategoryWithPosts);

//post routes
router
  .route("/api/post")
  .post(validatePermission(PermissionType.POST_CREATE), createPost)
  .get(validatePermission(PermissionType.POST_VIEW), getPublishedPosts);
router.route("/api/post/user").get(getUserPosts);
router.route("/api/post/status").get(getPostByStatus);
router
  .route("/api/post/:id")
  .put(validatePermission(PermissionType.POST_UPDATE), updatePost)
  .post(validatePermission(PermissionType.POST_PUBLISH), publishPost)
  .get(validatePermission(PermissionType.POST_VIEW), getPostById)
  .delete(validatePermission(PermissionType.POST_DELETE), deletePost);
router
  .route("/api/post/status/:id")
  .put(validatePermission(PermissionType.POST_UPDATE), updatePostStatus);

// Like or Dislike Post
router.route("/api/post/like/:id").post(likeOrDislikePost);

// Comment Routes
router
  .route("/api/comment")
  .post(validatePermission(PermissionType.COMMENT_CREATE), addComment);
router
  .route("/api/comment/post/:postId")
  .get(validatePermission(PermissionType.COMMENT_VIEW), getCommentsOfPost);
router
  .route("/api/comment/:id")
  .delete(validatePermission(PermissionType.COMMENT_DELETE), deleteComment);

export default router;
