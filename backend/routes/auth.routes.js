import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // ✅ FIXED IMPORT
import dotenv from "dotenv";

dotenv.config(); // ✅ Load environment variables

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // ✅ Updated variable name

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { vunetid, password } = req.body;

    const existingUser = await User.findOne({ vunetid });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ vunetid, passwordHash: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { vunetid, password } = req.body;

    const user = await User.findOne({ vunetid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
