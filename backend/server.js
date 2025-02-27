import express from 'express';                                                       
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js'; // Import authentication routes
import itemRouter from './routes/item.router.js'; // Import lost items routes

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173' // Restrict to frontend URL
}));

// Connect to Database
connectDB();

// Routes
app.use("/auth", authRoutes); // Authentication routes
app.use("/items", itemRouter); // Lost items routes

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});