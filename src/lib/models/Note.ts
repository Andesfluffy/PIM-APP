import mongoose, { Schema, models } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Note || mongoose.model("Note", NoteSchema);
