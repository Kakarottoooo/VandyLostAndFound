import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  vunetid: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }, // Hashed password
}, { timestamps: true }); // Automatically adds createdAt & updatedAt fields

export const User = mongoose.model("User", UserSchema);
