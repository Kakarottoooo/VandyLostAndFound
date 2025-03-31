// Updated item.controller.js with Cloudinary Visual Search
import Item from "../models/item.model.js";
import mongoose from "mongoose";
import { cloudinary, addToVisualSearchIndex, getPublicIdFromUrl } from "../config/cloudinaryConfig.js";

// Create Item function with Visual Search indexing
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
            if (image && image.includes('cloudinary.com')) {
                console.log("Final image URL:", image);
                
                // Extract the public_id and add to visual search index
                const publicId = getPublicIdFromUrl(image);
                if (publicId) {
                    try {
                        await addToVisualSearchIndex(publicId);
                    } catch (indexError) {
                        console.error("Error adding image to visual search index:", indexError);
                        // Continue with item creation even if indexing fails
                    }
                }
            } else {
                console.warn("Image path does not contain cloudinary.com:", image);
                // If not a Cloudinary URL, don't use it
                image = "";
            }
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

// Update Item function with Visual Search indexing for new images
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
                
                // Extract the public_id and add to visual search index
                const publicId = getPublicIdFromUrl(imageUrl);
                if (publicId) {
                    try {
                        await addToVisualSearchIndex(publicId);
                    } catch (indexError) {
                        console.error("Error adding image to visual search index:", indexError);
                        // Continue with item update even if indexing fails
                    }
                }
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

// Delete Item function (unchanged)
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

// Enhanced getItems function with advanced filtering
export const getItems = async (req, res) => {
    try {
        console.log("==== Get Items with Advanced Search ====");
        console.log("Query parameters:", req.query);
        
        const { 
            search, 
            startDate, 
            endDate, 
            category, 
            itemType, 
            location
        } = req.query;
        
        // Build query filter
        const filter = {};
        const conditions = [];
        
        // Text search on name and description
        if (search) {
            // Create a text search across multiple fields
            conditions.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        // Date range filter
        if (startDate || endDate) {
            const dateFilter = {};
            
            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }
            
            if (endDate) {
                // Add one day to include the end date fully
                const endDateTime = new Date(endDate);
                endDateTime.setDate(endDateTime.getDate() + 1);
                dateFilter.$lte = endDateTime;
            }
            
            filter.dateFound = dateFilter;
        }
        
        // Category filter
        if (category) {
            // Handle multiple categories
            if (Array.isArray(category)) {
                filter.category = { $in: category };
            } else {
                filter.category = category;
            }
        }
        
        // Item type filter (lost/found)
        if (itemType) {
            filter.itemType = itemType;
        }
        
        // Location filter (text search across all location fields)
        if (location) {
            // Search for the location text in multiple location fields
            conditions.push({
                $or: [
                    { 'location.building': { $regex: location, $options: 'i' } },
                    { 'location.room': { $regex: location, $options: 'i' } },
                    { 'location.floor': { $regex: location, $options: 'i' } }
                ]
            });
        }
        
        // Combine all conditions with the filter
        if (conditions.length > 0) {
            filter.$and = conditions;
        }
        
        console.log("Applied filters:", JSON.stringify(filter, null, 2));
        
        // Execute the query with filters
        const items = await Item.find(filter)
            .populate('user', 'name email')
            .sort({ dateFound: -1 });  // Sort by date found (newest first)
        
        console.log(`Found ${items.length} items matching the criteria`);
        
        return res.status(200).json({ 
            success: true, 
            count: items.length,
            data: items 
        });
    } catch (error) {
        console.error("❌ Error in advanced search:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get distinct buildings for location filter
export const getLocations = async (req, res) => {
    try {
        // Get all distinct buildings
        const buildings = await Item.distinct('location.building');
        
        return res.status(200).json({ 
            success: true, 
            data: buildings.filter(building => building) // Filter out null/empty values
        });
    } catch (error) {
        console.error("❌ Error fetching locations:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all available categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Item.distinct('category');
        return res.status(200).json({ 
            success: true, 
            data: categories.filter(category => category) // Filter out null/empty values
        });
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get user items (unchanged)
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

// Get items for map (unchanged)
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

// Enhanced image similarity search with Cloudinary Visual Search
export const findSimilarImages = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No image file uploaded" 
            });
        }
        
        // Get the uploaded image URL from Cloudinary
        const uploadedImageUrl = req.file.path;
        
        if (!uploadedImageUrl || !uploadedImageUrl.includes('cloudinary.com')) {
            return res.status(400).json({
                success: false,
                message: "Invalid image upload. Please try again."
            });
        }
        
        // Extract the public_id from the URL
        const publicId = getPublicIdFromUrl(uploadedImageUrl);
        
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Unable to process image. Please try again."
            });
        }
        
        console.log("Finding images similar to:", publicId);
        
        try {
            // Add the upload to the visual search index for future searches
            await addToVisualSearchIndex(publicId);
            
            // Use Cloudinary's visual similarity search
            // Note: This requires a paid Cloudinary plan with AI Visual Search enabled
            const searchResult = await cloudinary.search
                .expression(`folder:lost-and-found AND tags:visual_search`)
                .sort_by('visual_similarity', publicId)
                .max_results(20)
                .execute();
            
            console.log("Search results:", JSON.stringify(searchResult, null, 2));
            
            if (!searchResult.resources || searchResult.resources.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No similar images found",
                    count: 0,
                    data: []
                });
            }
            
            // Extract the public IDs from the search results
            const similarPublicIds = searchResult.resources
                .filter(resource => resource.public_id !== publicId) // Filter out the search image
                .map(resource => {
                    // Extract just the filename part of the public_id
                    const parts = resource.public_id.split('/');
                    return parts[parts.length - 1];
                });
            
            console.log("Similar public IDs:", similarPublicIds);
            
            if (similarPublicIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No similar images found",
                    count: 0,
                    data: []
                });
            }
            
            // Find items with similar images in the database
            // Create regex patterns to match the public IDs in the image URLs
            const regexPatterns = similarPublicIds.map(id => new RegExp(id));
            
            const similarItems = await Item.find({
                image: { $in: regexPatterns }
            }).populate('user', 'name email');
            
            console.log("Found similar items:", similarItems.length);
            
            return res.status(200).json({
                success: true,
                count: similarItems.length,
                data: similarItems
            });
            
        } catch (searchError) {
            console.error("Error during visual search:", searchError);
            
            // Fallback: If visual search fails, return some items with images as fallback
            const fallbackItems = await Item.find({
                image: { $exists: true, $ne: "" }
            })
            .limit(10)
            .populate('user', 'name email');
            
            return res.status(200).json({
                success: true,
                message: "Visual search unavailable. Showing other items with images as fallback.",
                count: fallbackItems.length,
                data: fallbackItems
            });
        }
    } catch (error) {
        console.error("❌ Error in image similarity search:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get item by ID (unchanged)
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