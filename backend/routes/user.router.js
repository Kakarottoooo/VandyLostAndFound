import express from "express";
import User from "../models/user.js";
import Item from "../models/item.model.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users/profile - Fetch the logged-in user's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("createdItems")
      .populate("followedItems");
        
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// NEW ENDPOINT: GET /api/users/items - Fetch items created by the user
router.get("/items", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching items for user:", req.user.id);
    
    const items = await Item.find({ user: req.user.id });
    console.log(`Found ${items.length} items for user ${req.user.id}`);
    
    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Error fetching user's items:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/users/unfollow/:itemId - Unfollow an item
router.delete("/unfollow/:itemId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { followedItems: req.params.itemId } },
      { new: true }
    )
      .populate("createdItems")
      .populate("followedItems")
      .select("-password");
    
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error unfollowing item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/users/follow/:itemId - Follow an item
router.post("/follow/:itemId", authMiddleware, async (req, res) => {
  try {
    // Check if user is already following this item
    const existingUser = await User.findById(req.user.id);
    if (existingUser.followedItems.includes(req.params.itemId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this item"
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { followedItems: req.params.itemId } }, // Using $addToSet to avoid duplicates
      { new: true }
    )
      .populate("createdItems")
      .populate("followedItems")
      .select("-password");
    
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error following item:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export { router as userRouter };