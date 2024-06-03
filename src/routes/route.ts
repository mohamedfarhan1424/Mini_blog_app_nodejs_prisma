import { Router } from "express";
import {
  loginUser,
  registerUser,
  renewAccessToken,
} from "../controller/auth/auth";
import { getUser } from "../controller/user/user";
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
import { createPost } from "../controller/post/post";

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
  .route("/api/user/:userId")
  .get(validatePermission(PermissionType.USER_VIEW), getUser);

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
router.route("/api/category").get(getCategories).post(createCategory);
router.route("/api/category/:id").get(getCategoryWithPosts);

//post routes
router.route("/api/post").post(createPost);

export default router;
