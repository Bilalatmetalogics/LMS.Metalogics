import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean; // true when >= 75%
  lastUpdated: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    videoId: { type: Schema.Types.ObjectId, required: true },
    watchedSeconds: { type: Number, default: 0 },
    totalSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Unique per user+video
UserProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);
