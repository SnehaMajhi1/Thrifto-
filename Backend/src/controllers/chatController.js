const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification } = require('../utils/notificationHelper');


const listChats = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      participants: req.userId,
      isActive: true
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [chats, total] = await Promise.all([
      Chat.find(query)
        .populate('participants', 'name email profilePicture')
        .populate('relatedItem', 'title images')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ 'lastMessage.createdAt': -1 }),
      Chat.countDocuments(query)
    ]);

    return res.status(200).json({
      data: chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List chats error:', error);
    return res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

const createChat = async (req, res) => {
  try {
    const { participantId, relatedItem } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }

    if (participantId === req.userId) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // Check if chat already exists between these two users
    const existingChat = await Chat.findOne({
      participants: { $all: [req.userId, participantId] }
    });

    if (existingChat) {
      await existingChat.populate('participants', 'name email profilePicture');
      return res.status(200).json({ data: existingChat, message: 'Chat already exists' });
    }

    // Create new chat
    const chatData = {
      participants: [req.userId, participantId]
    };

    if (relatedItem) {
      chatData.relatedItem = relatedItem;
    }

    const chat = await Chat.create(chatData);
    await chat.populate('participants', 'name email profilePicture');

    return res.status(201).json({ data: chat });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create chat error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to create chat', error: error.message, stack: error.stack });
  }
};

const listMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a participant
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find({ chat: id })
        .populate('sender_id', 'name email profilePicture')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ timestamp: -1 }),
      Message.countDocuments({ chat: id })
    ]);

    // Mark messages as read
    await Message.updateMany(
      {
        chat: id,
        sender_id: { $ne: req.userId },
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return res.status(200).json({
      data: messages.reverse(), // Return in ascending order (oldest first)
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('List messages error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Verify user is a participant
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create message
    const recipientId = chat.participants.find(p => p.toString() !== req.userId);
    const msgData = {
      chat: id,
      sender_id: req.userId,
      receiver_id: recipientId,
      message: text.trim(),
      timestamp: new Date()
    };
    const message = await Message.create(msgData);

    // Update chat's lastMessage
    chat.lastMessage = {
      message: text.trim(),
      sender: req.userId,
      createdAt: message.timestamp
    };
    await chat.save();

    await message.populate([
      { path: 'sender_id', select: 'name email profilePicture' },
      { path: 'receiver_id', select: 'name email profilePicture' }
    ]);

    if (recipientId) {
      await sendNotification(recipientId, 'message', `New message from ${message.sender_id.name}: ${text.substring(0, 50)}...`, req.userId, id);
    }

    // Emit live message via Socket.io
    const { emitMessage } = require('../socket');
    emitMessage(id, message);

    // Log activity
    await logActivity(req.userId, 'sent a message', 'chat', `Chat ID: ${id}`, id);

    return res.status(201).json({ data: message });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Send message error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    return res.status(500).json({ message: 'Failed to send message' });
  }
};

const createAdminChat = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ message: 'No active admin found' });
    }

    if (admin._id.toString() === req.userId) {
      return res.status(400).json({ message: 'You are the admin' });
    }

    const existingChat = await Chat.findOne({
      participants: { $all: [req.userId, admin._id.toString()] }
    });

    if (existingChat) {
      await existingChat.populate('participants', 'name email profilePicture');
      return res.status(200).json({ data: existingChat, message: 'Chat already exists' });
    }

    const chatData = { participants: [req.userId, admin._id.toString()] };
    const chat = await Chat.create(chatData);
    await chat.populate('participants', 'name email profilePicture');

    return res.status(201).json({ data: chat });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create admin chat error:', error);
    return res.status(500).json({ message: 'Failed to create chat with admin' });
  }
};

module.exports = { listChats, createChat, listMessages, sendMessage, createAdminChat };
