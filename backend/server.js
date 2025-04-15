// File: backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import itemRouter from "./routes/item.router.js";
import { authRouter } from "./routes/auth.router.js";
import { userRouter } from "./routes/user.router.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { messageRouter } from "./routes/message.router.js";
import { upload, cloudinary } from "./config/cloudinaryConfig.js";
dotenv.config({ path: "../.env" });

// Check JWT_SECRET existence
console.log("JWT_SECRET Loaded:", process.env.JWT_SECRET ? "✅ Exists" : "❌ MISSING");

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: Missing JWT_SECRET in environment variables.");
  process.exit(1);
}

const app = express();

// ✅ Flexible CORS for both local and deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // Vite local dev
  "http://localhost:5174", // Alternative Vite port
  "http://127.0.0.1:5173", // Local IP variant
  "http://127.0.0.1:5174", // Local IP variant
  "https://vandyfind.netlify.app", // Netlify site
  "https://profile-3--vandyfind.netlify.app", // Your Netlify site
  "https://fluffy-fudge-c9f1af.netlify.app" // Your new Netlify site
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(null, true); // Temporarily allow all origins for debugging
        // callback(new Error("Not allowed by CORS")); // Enable this line later
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debugging middleware for all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ API Routes
app.use("/api/items", itemRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads"));
app.use("/api/messages", messageRouter);

// ✅ Protected Route Example
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Access granted to protected route!", user: req.user });
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🔗 Welcome to VandyLostAndFound API");
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📂 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
}

// Export app for testing
export default app;