// cloudinaryConfig.js
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
    resource_type: 'auto' // Auto-detect resource type
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

export { upload, cloudinary };