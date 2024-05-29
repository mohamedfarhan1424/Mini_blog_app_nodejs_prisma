import { Router } from "express";
import { loginUser, registerUser } from "../controller/auth/auth";
import { getUser } from "../controller/user/user";
import { validateJwtTokenMiddleware } from "../middleware/auth";

const router = Router();

// Hello World
router.route("/").get((req, res) => {
  return res.send("Hello World");
});

// Auth Routes
router.route("/api/register").post(registerUser);
router.route("/api/login").post(loginUser);

// Including middleware for upcoming routes
router.use("/api/*", validateJwtTokenMiddleware);

// User Routes
router.route("/api/user/:userId").get(getUser);

export default router;
