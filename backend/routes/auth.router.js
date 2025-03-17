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


      const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 465,
        secure: true,
        auth: {
          user: 'apikey', // Literally "apikey", not your email
          pass: process.env.SENDGRID_API_KEY, // Your SendGrid API key
        }
      });

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        text: `Hello ${name},\n\nPlease verify your email address by entering the following six-digit code:\n\n${verificationCode}\n\nThank you!`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ msg: "Couldn't send verification email" });
        }
      });

      const salt2 = await bcrypt.genSalt(10);
      const hashedVerificationCode = await bcrypt.hash(verificationCode, salt2);
      user.verificationCode = hashedVerificationCode;
      user.verificationCodeExpiration= Date.now() + 3600000; // 1 hour from now

      await user.save();
      return res.status(200).json({ msg: 'Registration successful. Please check your email for the verification code.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Verify Email Route
router.post('/verify-email',   [
  body('email', 'Valid Vanderbilt email is required').isEmail(),
  body('verificationCode', 'vc is required').exists(),
], async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const user = await User.findOne({
      email
    });

    if(!user) return res.status(400).json({ msg: 'User not found' });
    if (user.verificationCodeExpiration < Date.now()) {
      return res.status(400).json({ msg: 'Verification code expired' });
    }
    // Compare the hashed verification code with the one provided by the user
    const isMatch = await bcrypt.compare(String(verificationCode), String(user.verificationCode));
    if (!isMatch) return res.status(400).json({ msg: 'Invalid verification code' });
    user.isVerified = true;
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.json({ token, user: { id: user.id, name: user.name, email } });

  } catch (err) {
    console.error(err.message);
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
      if(!user.isVerified) return res.status(400).json({ msg: 'Email not verified' });
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

export { router as authRouter };
