import express from "express";
import {
  getUser,
  createUser,
  login,
  logout,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/user", getUser);

router.post("/createUser", createUser);

router.post("/login", login);

router.post("/logout", logout);

export default router;
