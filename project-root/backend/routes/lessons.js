import express from "express";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import { requireAdmin } from "./auth.js"; // Or define it in a shared file
import jwt from "jsonwebtoken";

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

const router = express.Router();

// Get all lessons (only id and title)
router.get("/", async (req, res) => {
  const { username } = req.query;
  try {
    const filter = username ? { for: username } : {};
    // When fetching lessons
    const lessons = await Lesson.find(filter, { title: 1, description: 1, date: 1, thumb: 1, slides: 1, notes: 1 });
    console.log("Lessons returned:", lessons);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lessons" });
  }
});

// Get a single lesson by ID
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lesson" });
  }
});

// (Optional) Create a lesson
router.post("/", authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const lessonData = { ...req.body };
    delete lessonData._id;
    if (lessonData.date && lessonData.date.$date) {
      lessonData.date = new Date(lessonData.date.$date);
    }
    const lesson = new Lesson(lessonData);
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    console.error("Lesson creation error:", err);
    res.status(500).json({ message: "Error creating lesson", error: err.message });
  }
});

router.post("/complete", async (req, res) => {
  const { userId, lessonId, mistakes } = req.body;
  try {
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { completedLessons: lessonId },
        $pull: { lessonMistakes: { lessonId } }
      }
    );
    await User.findByIdAndUpdate(
      userId,
      {
        $push: { lessonMistakes: { lessonId, mistakes } }
      }
    );
    res.json({ message: "Lesson marked as completed." });
  } catch (err) {
    res.status(500).json({ message: "Error marking lesson as completed." });
  }
});

export default router;
