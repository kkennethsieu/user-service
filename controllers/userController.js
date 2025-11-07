import db from "../db/db.js";
import dotenv from "dotenv";
dotenv.config();

// Louie
export const createUser = (
  mfatoken,
  username,
  password,
  phoneNumber,
  profile = null
) => {
  if (mfatoken !== process.env.MFA_TOKEN) {
    throw new Error("Invalid MFA token");
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
export const login = (username, password) => {};

// Kenneth
export const logout = (userId) => {};
