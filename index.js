import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./db/db.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
