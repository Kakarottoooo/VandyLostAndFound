// Complete updated version of item.controller.js
import Item from "../models/item.model.js";

// ✅ Create Item (Supports Image Upload)
export const createItem = async (req, res) => {
    try {
        const { name, description, dateFound, category, itemType, location } = req.body;
        
        if (!name || !dateFound || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        
        // Parse location if it's a string
        let locationData = location;
        if (typeof location === 'string') {
            try {
                locationData = JSON.parse(location);
            } catch (err) {
                console.error("Error parsing location:", err);
                locationData = {};
            }
        }

        // Use a relative path or full production URL
        const image = req.file ? `/uploads/${req.file.filename}` : "";
        
        // Include the user ID from the authenticated request
        const newItem = new Item({
            name,
            description,
            dateFound: new Date(dateFound),
            image,
            category: category || 'Other',
            itemType: itemType || 'found',
            location: locationData,
            user: req.user.id // Add this line to set the user ID
        });
        
        await newItem.save();
        return res.status(201).json({ success: true, data: newItem });
        
    } catch (error) {
        console.error("❌ Error creating item:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Delete Item with owner verification
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        
        // Find the item and check if the user is the owner
        const item = await Item.findById(itemId);
        
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        
        // Check if the user is the owner of the item (if item has a user field)
        if (item.user && item.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You don't have permission to delete this item" });
        }
        
        // Delete the item
        await Item.findByIdAndDelete(itemId);
        
        return res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting item:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update Item
export const updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;
        
        // Find the item and check if the user is the owner
        const item = await Item.findById(itemId);
        
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        
        // Check if the user is the owner of the item
        if (item.user && item.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You don't have permission to update this item" });
        }
        
        if (req.body.dateFound) {
            req.body.dateFound = new Date(req.body.dateFound);
        }

        // If a new image is uploaded, update image URL
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }

        const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, { new: true });

        return res.status(200).json({ success: true, message: "Item updated successfully", data: updatedItem });
    } catch (error) {
        console.error("❌ Error updating item:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Fetch All Items
export const getItems = async (req, res) => {
    try {
        const items = await Item.find().populate('user', 'name email');
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("❌ Error fetching items:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get user's created items
export const getUserItems = async (req, res) => {
    try {
        // Get user ID from the authenticated request
        const userId = req.user.id;
        
        // Find all items created by this user
        const items = await Item.find({ user: userId });
        
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("❌ Error fetching user items:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get items for map view (simplified for map markers)
export const getItemsForMap = async (req, res) => {
    try {
        // Only get items with location coordinates
        const items = await Item.find({
            'location.coordinates': { $exists: true }
        })
        .select('name description image itemType location status');
        
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("❌ Error fetching map items:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get a single item by ID
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', 'name email');
        
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        
        return res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("❌ Error fetching item:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};