// File: /backend/controllers/message.controller.js
import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/user.js";

// ✅ Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique conversations
    const sentMessages = await Message.aggregate([
      { $match: { sender: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$recipient" } }
    ]);

    const receivedMessages = await Message.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$sender" } }
    ]);

    // Combine unique conversation partners
    const conversationPartnerIds = [
      ...new Set([
        ...sentMessages.map(m => m._id.toString()),
        ...receivedMessages.map(m => m._id.toString())
      ])
    ];

    // Get user details and latest message for each conversation
    const conversations = await Promise.all(
      conversationPartnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select("name email");
        const latestMessage = await Message.findOne({
          $or: [
            { sender: userId, recipient: partnerId },
            { sender: partnerId, recipient: userId }
          ]
        }).sort({ createdAt: -1 });

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: userId,
          read: false
        });

        return {
          partner,
          latestMessage,
          unreadCount
        };
      })
    );

    res.json({ success: true, conversations });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get messages between current user and another user
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    // Validate partnerId
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: partnerId },
        { sender: partnerId, recipient: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate("item", "name image");

    // Mark messages as read
    await Message.updateMany(
      {
        sender: partnerId,
        recipient: userId,
        read: false
      },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId, content, itemId } = req.body;
    
    console.log("Message sending attempt:", { 
      senderId, 
      recipientId, 
      content: content.substring(0, 20) + "...",
      itemId 
    });

    // Validate recipient
    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, message: "Invalid recipient ID format" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    // Create and save the message
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      item: itemId || null
    });

    await newMessage.save();

    // Populate sender, recipient, and item information
    await newMessage.populate("sender", "name email");
    await newMessage.populate("recipient", "name email");
    if (itemId) {
      await newMessage.populate("item", "name image");
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};