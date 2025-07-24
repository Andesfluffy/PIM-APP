import mongoose, { Schema, models } from "mongoose";

const ContactSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Contact || mongoose.model("Contact", ContactSchema);
