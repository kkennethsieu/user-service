import db from ".db/db.js";
import dotenv from "dotenv";
dotenv.config();

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

export const getUser = (userId) => {
  const stmt = db.prepare("SELECT * FROM users WHERE userId = ?");

  console.log("Fetching user with ID:", userId);
  return stmt.get(userId);
};

export const updateUser = (userId, newDetails) => {};

const profilVerify = (profile) => {
  return profile.bio && profile.favGame && profile.urlPic;
};

export const login = (username, password) => {};

export const logout = (userId) => {};
