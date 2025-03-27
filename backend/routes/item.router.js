// Updated version of item.router.js
import express from "express";
import multer from "multer";
import { createItem, deleteItem, updateItem, getItems, getUserItems, getItemsForMap, getItemById } from "../controllers/item.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images to "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Add a simple test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Item router is working" });
});

// Create a myitems route instead of user/items to avoid conflicts
router.get("/myitems", authMiddleware, getUserItems);

// Standard routes
router.get("/", getItems);
router.post("/", authMiddleware, upload.single("image"), createItem);
router.delete("/:id", authMiddleware, deleteItem);
router.patch("/:id", authMiddleware, upload.single("image"), updateItem);
router.get("/map", getItemsForMap);

// This should be the LAST route
router.get("/:id", getItemById);

export default router;