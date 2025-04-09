// cloudinaryConfig.js with AI Visual Search capabilities
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables with proper path resolution
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// Log Cloudinary config for debugging
console.log("Cloudinary Config Status:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "Not found");
console.log("API_KEY exists:", process.env.CLOUDINARY_API_KEY ? "Yes" : "No");
console.log("API_SECRET exists:", process.env.CLOUDINARY_API_SECRET ? "Yes" : "No");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine with specific configuration for Heroku
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lost-and-found',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }], // Optimize image size
    format: 'jpg', // Convert all uploads to jpg for consistency
    resource_type: 'auto', // Auto-detect resource type
    // Add these parameters to enable AI indexing for Visual Search
    tags: ['visual_search'], // Tag all images for visual search
    // Note: The auto_tagging and visual_similarity features require a paid plan
  },
});

// Create upload middleware with file size limits
const upload = multer({
  storage, // Use Cloudinary storage (not local disk storage)
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for Heroku
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

// Helper function to add an image to the visual search index
const addToVisualSearchIndex = async (publicId) => {
  try {
    // Make sure the publicId is in the correct format
    const formattedId = publicId.startsWith('lost-and-found/') 
      ? publicId 
      : `lost-and-found/${publicId}`;
      
    await cloudinary.uploader.add_tag("visual_search", formattedId);
    console.log(`Added ${formattedId} to visual search index`);
    return true;
  } catch (error) {
    console.error("Error adding to visual search index:", error);
    return false;
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/lost-and-found/abc123.jpg
    const urlParts = url.split('/');
    // Find the index of "lost-and-found" folder
    const folderIndex = urlParts.findIndex(part => part === 'lost-and-found');
    
    if (folderIndex === -1) return null;
    
    // Get the filename (with extension)
    const fileNameWithExt = urlParts[folderIndex + 1];
    // Remove extension and return the public ID
    const publicId = fileNameWithExt.split('.')[0];
    
    return `lost-and-found/${publicId}`;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
};

export { upload, cloudinary, addToVisualSearchIndex, getPublicIdFromUrl };
