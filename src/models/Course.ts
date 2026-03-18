import mongoose, { Schema, Document } from "mongoose";

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  url: string;
  duration: number; // seconds
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
  createdBy: mongoose.Types.ObjectId;
  modules: IModule[];
  status: "draft" | "published";
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  url: { type: String, required: true },
  duration: { type: Number, default: 0 },
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    modules: [ModuleSchema],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
