import express from "express";
import { 
    createItem, 
    deleteItem, 
    updateItem, 
    getItems, 
    updateItemUrgency // ✅ Added function for urgency update
} from "../controllers/item.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js"; // ✅ Import authentication middleware

const router = express.Router();

// ✅ Protect `POST /items` (Only logged-in users can create items)
router.post("/", authMiddleware, createItem);

router.delete("/:id", deleteItem);
router.patch("/:id", updateItem);
router.get("/", getItems);

// ✅ Route to update the "urgent" status of an item
router.patch("/:id/urgent", authMiddleware, updateItemUrgency);

export default router;
