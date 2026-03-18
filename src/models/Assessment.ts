import mongoose, { Schema, Document } from "mongoose";

export type QuestionType = "mcq" | "truefalse" | "short";

export interface IQuestion {
  _id: mongoose.Types.ObjectId;
  type: QuestionType;
  text: string;
  options?: string[]; // for mcq
  correctAnswer?: string; // for mcq / truefalse
}

export interface IAssessment extends Document {
  moduleId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  questions: IQuestion[];
  passingScore: number; // percentage 0-100
}

const QuestionSchema = new Schema<IQuestion>({
  type: { type: String, enum: ["mcq", "truefalse", "short"], required: true },
  text: { type: String, required: true },
  options: [String],
  correctAnswer: String,
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    questions: [QuestionSchema],
    passingScore: { type: Number, default: 70 },
  },
  { timestamps: true },
);

export default mongoose.models.Assessment ||
  mongoose.model<IAssessment>("Assessment", AssessmentSchema);
