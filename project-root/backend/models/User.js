import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  name: String,
  profilePicture: String,
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  lessonMistakes: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    mistakes: { type: Number, default: 0 }
  }],
  resetToken: String,
  resetTokenExpiry: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

export default mongoose.model("User", userSchema);