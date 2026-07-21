const { Conversation, Message } = require('../models/mongodb/Message');
const { User } = require('../models/mysql');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    }).sort({ lastMessageAt: -1 });

    // Fetch participant details from MySQL
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherParticipantId = conv.participants.find(p => p !== req.user.id);
      const otherUser = await User.findByPk(otherParticipantId, {
        attributes: ['id', 'username', 'fullName', 'avatarUrl']
      });
      return {
        ...conv.toJSON(),
        otherUser: otherUser ? otherUser.toJSON() : null
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
    const { conversationId, receiverId, text, image } = req.body;
    
    // Validate: must have either text or image
    if ((!text || text.trim() === '') && !image) {
      return res.status(400).json({ message: 'Message must have text or image' });
    }
    
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

    const messageData = {
      conversationId: actualConvId,
      senderId: req.user.id,
    };
    if (text) messageData.text = text;
    if (image) messageData.image = image;

    const message = await Message.create(messageData);

    await Conversation.findByIdAndUpdate(actualConvId, {
      lastMessage: text || '[Hình ảnh]',
      lastMessageAt: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  uploadImage
};
