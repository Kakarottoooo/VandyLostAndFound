// Update your authMiddleware.js to match your token structure
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // ✅ Get Bearer Token
    
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Log the decoded token to understand its structure
        console.log("Decoded token:", decoded);
        
        // Handle both possible token structures
        if (decoded.user) {
            req.user = decoded.user;
        } else if (decoded.id) {
            req.user = { id: decoded.id };
        } else {
            throw new Error("Invalid token structure");
        }
        
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ msg: "Invalid token" });
    }
};