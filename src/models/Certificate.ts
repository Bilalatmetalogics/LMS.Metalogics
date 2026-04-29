import mongoose, { Schema, Document } from "mongoose";

export type CertificateStatus = "pending" | "approved" | "rejected";

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: CertificateStatus;
  approvedBy?: mongoose.Types.ObjectId;
  issuedAt?: Date;
  // Editable display fields — admin can customize before approving
  displayName?: string; // overrides userId.name on the certificate
  displayCourseTitle?: string; // overrides courseId.title on the certificate
  displayDuration?: string; // e.g. "8 hours", "3 weeks"
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    issuedAt: { type: Date },
    displayName: { type: String },
    displayCourseTitle: { type: String },
    displayDuration: { type: String },
  },
  { timestamps: true },
);

// One certificate per student per course
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
