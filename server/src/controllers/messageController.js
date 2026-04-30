const { Conversation, Message } = require('../models/mongodb/Message');
const { User } = require('../models/mysql');
const { Op } = require('sequelize');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    }).sort({ lastMessageAt: -1 });

    // Fetch participant details from MySQL
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherParticipantId = conv.participants.find(p => p !== req.user.id);
      const otherUser = await User.findByPk(otherParticipantId, {
        attributes: ['username', 'fullName', 'avatarUrl']
      });
      return {
        ...conv.toJSON(),
        otherUser
      };
    }));

    res.json(enrichedConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;
    let actualConvId = conversationId;

    if (!actualConvId) {
      // Find or create conversation
      let conv = await Conversation.findOne({
        participants: { $all: [req.user.id, receiverId] }
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: [req.user.id, receiverId]
        });
      }
      actualConvId = conv._id;
    }

    const message = await Message.create({
      conversationId: actualConvId,
      senderId: req.user.id,
      text
    });

    await Conversation.findByIdAndUpdate(actualConvId, {
      lastMessage: text,
      lastMessageAt: Date.now()
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};
