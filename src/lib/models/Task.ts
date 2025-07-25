import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Task || mongoose.model("Task", TaskSchema);
