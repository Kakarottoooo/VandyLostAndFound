// Complete fixed version of item.controller.js
import Item from "../models/item.model.js";

// Fixed createItem function for Cloudinary
export const createItem = async (req, res) => {
    try {
        console.log("==== Create Item Request ====");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        
        const { name, description, dateFound, category, itemType, location } = req.body;
        
        if (!name || !dateFound || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        
        // Parse location if it's a string
        let locationData = location;
        if (typeof location === 'string') {
            try {
                locationData = JSON.parse(location);
                console.log("Parsed location data:", locationData);
            } catch (err) {
                console.error("Error parsing location:", err);
                console.error("Original location value:", location);
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid location format", 
                    details: err.message 
                });
            }
        }

        // Validate locationData structure
        if (!locationData || !locationData.building) {
            return res.status(400).json({ 
                success: false, 
                message: "Location must include a building" 
            });
        }

        // Get the image URL from Cloudinary
        // When using multer-storage-cloudinary, the Cloudinary URL is stored in req.file.path
        let image = "";
        if (req.file) {
            console.log("Image file received:", req.file);
            image = req.file.path || "";
            
            // Ensure we're using the Cloudinary URL, not a local path
            if (image && !image.includes('cloudinary.com')) {
                console.warn("Image path does not contain cloudinary.com:", image);
                // If not a Cloudinary URL, don't use it
                image = "";
            }
            
            console.log("Final image URL:", image);
        }
        
        // Make sure req.user exists
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated or missing ID" 
            });
        }

        // Create the item object
        const itemData = {
            name,
            description,
            dateFound: new Date(dateFound),
            image,
            category: category || 'Other',
            itemType: itemType || 'found',
            location: locationData,
            user: req.user.id
        };
        
        console.log("Creating new item with data:", itemData);
        
        // Create and save the item
        const newItem = new Item(itemData);
        const savedItem = await newItem.save();
        
        console.log("Item saved successfully:", savedItem._id);
        return res.status(201).json({ success: true, data: savedItem });
        
    } catch (error) {
        console.error("❌ Error creating item:", error);
        // Send more detailed error information
        return res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};

// Updated updateItem function for Cloudinary
export const updateItem = async (req, res) => {
    try {
        console.log("==== Update Item Request ====");
        console.log("Item ID:", req.params.id);
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        
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
        
        // Process the update data
        const updateData = { ...req.body };
        
        // Convert dateFound to a Date object if provided
        if (updateData.dateFound) {
            updateData.dateFound = new Date(updateData.dateFound);
        }

        // Handle image updates
        if (req.file) {
            console.log("New image file received:", req.file);
            // When using multer-storage-cloudinary, the Cloudinary URL is in req.file.path
            const imageUrl = req.file.path || "";
            
            // Ensure we're using the Cloudinary URL, not a local path
            if (imageUrl && imageUrl.includes('cloudinary.com')) {
                updateData.image = imageUrl;
                console.log("Updated image URL:", imageUrl);
            } else {
                console.warn("Image path does not contain cloudinary.com:", imageUrl);
                // If not a Cloudinary URL, don't update the image
            }
        }

        // Handle location updates
        if (updateData.location && typeof updateData.location === 'string') {
            try {
                updateData.location = JSON.parse(updateData.location);
            } catch (err) {
                console.error("Error parsing location:", err);
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid location format", 
                    details: err.message 
                });
            }
        }

        console.log("Update data:", updateData);
        
        // Update the item
        const updatedItem = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

        return res.status(200).json({ success: true, message: "Item updated successfully", data: updatedItem });
    } catch (error) {
        console.error("❌ Error updating item:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Keep the rest of your controller methods as they are
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

export const getItems = async (req, res) => {
    try {
        const items = await Item.find().populate('user', 'name email');
        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("❌ Error fetching items:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

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