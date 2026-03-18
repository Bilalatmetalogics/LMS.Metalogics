import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  answer: string;
  isCorrect?: boolean;
}

export interface IAssessmentResult extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number; // percentage
  passed: boolean;
  gradedAt?: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  answer: { type: String, required: true },
  isCorrect: Boolean,
});

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    answers: [AnswerSchema],
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    gradedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.AssessmentResult ||
  mongoose.model<IAssessmentResult>("AssessmentResult", AssessmentResultSchema);
