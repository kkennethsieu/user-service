import express from "express";
import {
  getUser,
  createUser,
  login,
  logout,
  refreshToken,
  MFACheck,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json("Auth microservice is running");
});

router.get("/user/:userId", getUser);

router.post("/createUser", createUser);

router.put("/updateUser/:userId", updateUser);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/MFA-check", MFACheck);

export default router;
