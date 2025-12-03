import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "../db/db.js";
import { createTokens } from "../utils/createTokens.js";
import bcrypt from "bcryptjs";
dotenv.config();

const avatars = [
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/921/921347.png",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
  },
  {
    avatarURL: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
  },
];

const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
// Louie
export const createUser = async (req, res) => {
  try {
    const { username, password, phoneNumber } = req.body;

    // check if the username is there
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");

    const currentUser = stmt.get(username);

    if (currentUser) {
      return res.status(400).json({ message: "Username already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mfaToken = Math.floor(100000 + Math.random() * 900000);

    // make new user
    const stmt2 = db.prepare(
      "INSERT INTO users (username, password, phoneNumber,avatarUrl, mfaToken) VALUES (?,?,?,?)"
    );

    const info = stmt2.run(
      username,
      hashedPassword,
      phoneNumber,
      randomAvatar,
      mfaToken
    );

    const userId = info.lastInsertRowid;

    res.status(201).json({
      message: "User created, verify MFA",
      user: {
        userId,
        username,
        phoneNumber,
        mfaToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid request" });
  }
};

// MFA Check needs to receive
export const MFACheck = async (req, res) => {
  const { mfaInput, mfaToken } = req.body;

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE mfaToken = ? LIMIT 1")
      .get(mfaInput);

    if (user) {
      console.log("MFA verified");

      db.prepare("UPDATE users SET mfaToken = NULL WHERE mfaToken = ?").run(
        mfaToken
      );

      const { accessToken, refreshToken } = createTokens(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "MFA Verified",
        accessToken,
        user: { ...user, password: undefined },
      });
    } else {
      console.log("MFA failed, deleting user");
      db.prepare("DELETE FROM users WHERE mfaToken = ?").run(mfaToken);
      res.status(400).json({ error: "MFA Failed" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const stmt = db.prepare(
      "SELECT username, avatarURL, phoneNumber, userBio FROM users WHERE userId = ?"
    );
    const user = stmt.get(userId); // synchronous call
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Will
export const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { username, avatarURL, phoneNumber, userBio } = req.body;

  try {
    const stmt = db.prepare(
      "UPDATE users SET username = ?, avatarURL = ?, phoneNumber = ?, userBio = ? WHERE userId = ?"
    );
    stmt.run(username, avatarURL, phoneNumber, userBio, userId);
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Failed to update user" });
  }
};

// Kenneth
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // we want to check if the usrname exists
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = await stmt.get(username);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // we want to compare the password if it is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //generate two tokens
    const { accessToken, refreshToken } = createTokens(user);
    // we set the refresh token in a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //for dev = false, for production = true
      sameSite: "Lax", // will only send to the same site that requested it
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //we send back the user information to put on the front end like avatar picture...etc
    // im not sure if we added a profile, bio into the db yet
    res.status(200).json({
      message: "User successfully logged in",
      accessToken,
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "error logging in" });
  }
};

//IF the auth middleware fails, this is called to refresh the access token if we have one
export const refreshToken = async (req, res) => {
  // gets the token from the cookies we set before
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Invalid token" });

  //verifies with our secret
  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    // we send another access token
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken });
  } catch (error) {
    //if we don't have a refresh token, we just sign out
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 0,
    });
    return res.status(401).json({ error: "invalid or expired refresh token" });
  }
};

// Kenneth
export const logout = (req, res) => {
  // reset the cookie to nothing
  res.cookie("refreshToken", " ", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 0,
  });
  return res.json({ message: "Logged out successfully" });
};
