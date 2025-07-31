import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default models.Task || mongoose.model("Task", TaskSchema);
