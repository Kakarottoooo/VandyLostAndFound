import express from "express";
import { createItem, deleteItem, updateItem, getItems } from "../controllers/item.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // ✅ Authentication middleware
import { upload } from "../config/cloudinaryConfig.js"; // ✅ Cloudinary upload config

const router = express.Router();

// POST → Create item (auth required) + upload image
router.post("/", authMiddleware, upload.single("image"), createItem);

// GET → Fetch all items (no auth needed)
router.get("/", getItems);

// DELETE → Remove item (auth optional — you can add if needed)
router.delete("/:id", deleteItem);

// PATCH → Update item + optional new image upload
router.patch("/:id", upload.single("image"), updateItem);

export default router;
