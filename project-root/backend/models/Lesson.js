import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  id: Number,
  content: String,
  questionType: String,
  options: [String],
  correctAnswer: String
});

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  slides: [slideSchema],
  for: [String],
  date: { type: Date, default: Date.now },
  thumb: String,
  notes: [String] // <-- Add this line!
});

export default mongoose.model("Lesson", lessonSchema);
