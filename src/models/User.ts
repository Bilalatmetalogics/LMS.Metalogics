import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "instructor" | "student";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  assignedCourses: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      default: "student",
    },
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
