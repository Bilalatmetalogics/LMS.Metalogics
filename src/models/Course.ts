import mongoose, { Schema, Document } from "mongoose";

export type ContentType = "video" | "youtube" | "link" | "pdf";

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  url: string; // raw Cloudinary URL or external URL
  publicId?: string; // Cloudinary public_id — present only for uploaded assets
  type: ContentType;
  duration: number; // seconds — only relevant for video/youtube
  description?: string;
  thumbnailUrl?: string;
}

export interface IModule {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  videos: IVideo[];
  assessmentId?: mongoose.Types.ObjectId;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced";
  createdBy: mongoose.Types.ObjectId;
  modules: IModule[];
  status: "draft" | "published";
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  url: { type: String, required: true },
  publicId: String,
  type: {
    type: String,
    enum: ["video", "youtube", "link", "pdf"],
    default: "video",
  },
  duration: { type: Number, default: 0 },
  description: String,
  thumbnailUrl: String,
});

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  videos: [VideoSchema],
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment" },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: String,
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    modules: [ModuleSchema],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
