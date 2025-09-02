import express from "express";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // Use hashed passwords in production!
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET, // Set this in your .env file
    { expiresIn: "2h" }
  );

  res.json({
    userId: user._id,
    name: user.name,
    username: user.username,
    completedLessons: user.completedLessons,
    lessonMistakes: user.lessonMistakes,
    profilePicture: user.profilePicture,
    role: user.role,
    token
  });
});

router.post("/user", async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    userId: user._id,
    name: user.name,
    username: user.username,
    completedLessons: user.completedLessons,
    lessonMistakes: user.lessonMistakes,
    profilePicture: user.profilePicture,
    role: user.role // <-- Add this line!
  });
});

// Upload route
router.post("/upload-profile-picture", upload.single("profilePicture"), async (req, res) => {
  const userId = req.body.userId;
  const imageUrl = req.file.path; // Cloudinary URL
  await User.findByIdAndUpdate(userId, { profilePicture: imageUrl });
  res.json({ profilePicture: imageUrl });
});

// Request password reset
router.post("/request-password-reset", async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findOne({ username, email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes
  await user.save();

  // Send email (configure transporter for your provider)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, //
      pass: process.env.EMAIL_PASS
    }
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    text: `Click here to reset your password: ${resetLink}`
  });

  res.json({ message: "Password reset link sent to your email." });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = newPassword; // Hash in production!
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
});

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required." });
  }
}

router.get("/users", async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter, { _id: 1, username: 1, name: 1 });
  console.log(users)
  res.json(users);
});

export default router;