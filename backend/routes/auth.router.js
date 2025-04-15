// File: backend/routes/auth.router.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

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
    console.log("Register endpoint hit with data:", req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log("Extracted data:", { name, email, passwordLength: password?.length });

    if (!isVanderbiltEmail(email)) {
      console.log("Email validation failed:", email);
      return res.status(400).json({ msg: 'Only Vanderbilt email addresses are allowed!' });
    }

    try {
      let user = await User.findOne({ email });
      if (user) {
        console.log("User already exists with email:", email);
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated verification code for", email);
      
      // Hash verification code
      const salt2 = await bcrypt.genSalt(10);
      const hashedVerificationCode = await bcrypt.hash(verificationCode, salt2);
      
      // Create new user
      user = new User({ 
        name, 
        email, 
        password: hashedPassword,
        verificationCode: hashedVerificationCode,
        verificationCodeExpiration: Date.now() + 3600000 // 1 hour from now
      });

      // Save user to database first
      console.log("Saving new user to database");
      await user.save();
      console.log("User saved successfully");
      
      // Try to send email but don't let it block the response
      try {
        console.log("Creating email transport");
        const transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 465,
          secure: true,
          auth: {
            user: 'apikey', // Literally "apikey", not your email
            pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your email address',
          text: `Hello ${name},\n\nPlease verify your email address by entering the following six-digit code:\n\n${verificationCode}\n\nThank you!`,
        };

        console.log("Attempting to send verification email to", email);
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } catch (emailError) {
        // Just log the error but continue with the registration
        console.error("Email sending error:", emailError);
      }

      // Return success response once at the end
      return res.status(200).json({ 
        msg: 'Registration successful. Please check your email for the verification code.'
      });
    } catch (err) {
      console.error("Registration error:", err.message);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
);

// Verify Email Route
router.post('/verify-email',   [
  body('email', 'Valid Vanderbilt email is required').isEmail(),
  body('verificationCode', 'vc is required').exists(),
], async (req, res) => {
  console.log("Verify email endpoint hit with data:", req.body);
  const { email, verificationCode } = req.body;
  try {
    const user = await User.findOne({
      email
    });

    if(!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({ msg: 'User not found' });
    }
    
    if (user.verificationCodeExpiration < Date.now()) {
      console.log("Verification code expired for user:", email);
      return res.status(400).json({ msg: 'Verification code expired' });
    }
    
    // Compare the hashed verification code with the one provided by the user
    const isMatch = await bcrypt.compare(String(verificationCode), String(user.verificationCode));
    if (!isMatch) {
      console.log("Invalid verification code provided for user:", email);
      return res.status(400).json({ msg: 'Invalid verification code' });
    }
    
    user.isVerified = true;
    await user.save();
    console.log("User verified successfully:", email);
    
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email } });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).send('Server Error');
  }
});

// Login Route
router.post(
  '/login',
  [
    body('email', 'Valid Vanderbilt email is required').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    console.log("Login endpoint hit with data:", req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!isVanderbiltEmail(email)) {
      console.log("Email validation failed:", email);
      return res.status(400).json({ msg: 'Only Vanderbilt email addresses are allowed!' });
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        console.log("User not found with email:", email);
        return res.status(400).json({ msg: 'Account does not exist' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Incorrect password for user:", email);
        return res.status(400).json({ msg: 'Incorrect password' });
      }

      if(!user.isVerified) {
        console.log("Email not verified for user:", email);
        return res.status(400).json({ msg: 'Email not verified' });
      }
      
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log("User logged in successfully:", email);
      res.json({ token, user: { id: user.id, name: user.name, email } });
    } catch (err) {
      console.error("Login error:", err.message);
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

export { router as authRouter };