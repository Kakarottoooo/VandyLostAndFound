// Updated version of item.router.js with advanced search endpoints
import express from "express";
import { 
    createItem, 
    deleteItem, 
    updateItem, 
    getItems, 
    getUserItems, 
    getItemsForMap, 
    getItemById,
    getLocations,
    getCategories,
    findSimilarImages
} from "../controllers/item.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinaryConfig.js";

const router = express.Router();

// Add a simple test route to verify the router is working
router.get("/test", (req, res) => {
    res.json({ message: "Item router is working" });
});

// Create a myitems route instead of user/items to avoid conflicts
router.get("/myitems", authMiddleware, getUserItems);

// New meta-data routes for filters
router.get("/locations", getLocations);
router.get("/categories", getCategories);

// Image similarity search endpoint
router.post("/image-search", upload.single("image"), findSimilarImages);

// Standard routes
router.get("/", getItems);
router.post("/", authMiddleware, upload.single("image"), createItem);
router.delete("/:id", authMiddleware, deleteItem);
router.patch("/:id", authMiddleware, upload.single("image"), updateItem);
router.get("/map", getItemsForMap);

// This should be the LAST route
router.get("/:id", getItemById);

export default router;