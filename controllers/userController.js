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

    //generate a token

    //we send back the user information to put on the front end like avatar picture...etc
    // im not sure if we added a profile, bio into the db yet
    res.status(200).json({
      message: "User successfully logged in",
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

// Kenneth
export const logout = (req, res) => {};
