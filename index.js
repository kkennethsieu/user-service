import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
