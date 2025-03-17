import Item from "../models/item.model.js";

// ✅ Create Item (Supports Image Upload)
export const createItem = async (req, res) => {
  try {
    const { name, description, dateFound } = req.body;
    if (!name || !dateFound || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Cloudinary sets req.file.path to the public URL of the uploaded image
    const imageUrl = req.file ? req.file.path : "";

    const newItem = new Item({
      name,
      description,
      dateFound: new Date(dateFound),
      image: imageUrl,
    });

    await newItem.save();
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error("❌ Error creating item:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Item
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (item) {
      return res
        .status(200)
        .json({ success: true, message: "Item deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Item
export const updateItem = async (req, res) => {
  try {
    if (req.body.dateFound) {
      req.body.dateFound = new Date(req.body.dateFound);
    }

    // If a new image is uploaded to Cloudinary, set req.body.image to req.file.path
    if (req.file) {
      req.body.image = req.file.path;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (updatedItem) {
      return res
        .status(200)
        .json({
          success: true,
          message: "Item updated successfully",
          data: updatedItem,
        });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
  } catch (error) {
    console.error("❌ Error updating item:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Fetch All Items
export const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
