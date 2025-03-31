import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import Item from '../models/item.model.js'; // Import Item model
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

const isVanderbiltEmail = (email) => email.toLowerCase().endsWith('@vanderbilt.edu');

// Register Route
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Valid Vanderbilt email is required').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { name, email, password } = req.body;
    
    if (!isVanderbiltEmail(email)) {
      return res.status(400).json({ msg: 'Only Vanderbilt email addresses are allowed!' });
    }
    
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({ name, email, password: hashedPassword });
      await user.save();
      
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.json({ token, user: { id: user.id, name, email } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Login Route
router.post(
  '/login',
  [
    body('email', 'Valid Vanderbilt email is required').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { email, password } = req.body;
    
    if (!isVanderbiltEmail(email)) {
      return res.status(400).json({ msg: 'Only Vanderbilt email addresses are allowed!' });
    }
    
    try {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
      
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.json({ token, user: { id: user.id, name: user.name, email } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Fetch Logged-in User Data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Also add the /profile endpoint for backward compatibility
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get user's items 
router.get('/items', authMiddleware, async (req, res) => {
  try {
    // Find all items created by this user
    const items = await Item.find({ user: req.user.id });
    
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching user items:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Follow an item
router.post('/follow/:itemId', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const userId = req.user.id;

    // Check if the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }

    // Check if user already follows this item
    const user = await User.findById(userId);
    if (user.followedItems && user.followedItems.includes(itemId)) {
      return res.status(400).json({ 
        success: false, 
        message: "You are already following this item" 
      });
    }

    // Add the item to user's followed items
    await User.findByIdAndUpdate(
      userId,
      { $push: { followedItems: itemId } },
      { new: true }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Item followed successfully" 
    });
  } catch (error) {
    console.error("Error following item:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Unfollow an item
router.delete('/follow/:itemId', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const userId = req.user.id;

    // Check if user follows this item
    const user = await User.findById(userId);
    if (!user.followedItems || !user.followedItems.includes(itemId)) {
      return res.status(400).json({ 
        success: false, 
        message: "You are not following this item" 
      });
    }

    // Remove the item from user's followed items
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followedItems: itemId } },
      { new: true }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Item unfollowed successfully" 
    });
  } catch (error) {
    console.error("Error unfollowing item:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get followed items
router.get('/followed-items', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and populate followed items
    const user = await User.findById(userId).populate('followedItems');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: user.followedItems || [] 
    });
  } catch (error) {
    console.error("Error fetching followed items:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Check if user follows an item
router.get('/follows/:itemId', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isFollowing = user.followedItems && user.followedItems.includes(itemId);

    return res.status(200).json({ 
      success: true, 
      isFollowing 
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export { router as userRouter };