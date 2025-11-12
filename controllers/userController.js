import db from "../db/db.js";
import dotenv from "dotenv";
import { createTokens } from "../utils/createTokens.js";
import jwt from "jsonwebtoken";
import { createUser, updateUser, getUserById } from "../models/userModel.js";
dotenv.config();

// Louie
export const createUser = async ( mfatoken, req, res ) => {
  if (mfatoken !== process.env.MFA_TOKEN) {
    throw new Error("Invalid MFA token");
  }
  try {
    // turn request body into variables
    const { username, password, phoneNumber, profile = null } = req.body;

    // make new user
    const newUser = await createUser(mfatoken, username, password, phoneNumber, profile);

    // get result
    res.status(201).json(newUser);
  } catch(error) {
    res.status(400).json({"Error": "Invalid request"})
  }
};

export const getUser = async (req, res) => {
  const params = req.query;
  console.log("Received params:", req);
  const userId = params.userId;

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE userId = ?");
    console.log("Fetching user with ID:", userId);
    await res.json(stmt.get(userId));
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "User not found" });
  }
};

// Will
export const updateUser = (userId, newDetails) => {};

const profilVerify = (profile) => {
  return profile.bio && profile.favGame && profile.urlPic;
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
      sameSite: "Strict", // will only send to the same site that requested it
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
      sameSite: "Strict",
      maxAge: 0,
    });
    return res.status(401).json({ error: "invalid or expired refresh token" });
  }
};

// Kenneth
export const logout = (req, res) => {
  // reset the cookie to nothing
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 0,
  });
  return res.json({ message: "Logged out successfully" });
};
