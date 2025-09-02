import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import lessonsRouter from "./routes/lessons.js";
import authRouter from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allow requests from your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g., "https://yourdomain.com"
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use("/api/lessons", lessonsRouter);
app.use("/api/auth", authRouter);

app.listen(5000, () => console.log("Backend running on port 5000"));
