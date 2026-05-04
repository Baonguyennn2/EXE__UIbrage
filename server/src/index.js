const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const sequelize = require('./config/database');
const connectMongoDB = require('./config/mongodb');
require('./models/mysql'); // Load relations
const seed = require('./seeders');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this
    methods: ['GET', 'POST']
  }
});

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    if (!userId) return;
    
    // Track user's sockets
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.userId = userId;
    socket.join(userId);
    
    console.log(`User ${userId} joined their room (sockets: ${onlineUsers.get(userId).size})`);
    
    // Broadcast user online status
    io.emit('userOnline', { userId, online: true });
  });

  // Send & receive real-time message
  socket.on('sendMessage', (data) => {
    const { receiverId, conversationId, text, senderId } = data;
    
    // Broadcast to receiver's room
    io.to(receiverId).emit('newMessage', {
      ...data,
      _id: data._id || Date.now().toString(),
      createdAt: data.createdAt || new Date().toISOString()
    });

    // Also send back to sender (for other tabs)
    if (senderId) {
      io.to(senderId).emit('newMessage', data);
    }
  });

  // Typing indicators
  socket.on('typing', (data) => {
    const { receiverId, conversationId } = data;
    if (!receiverId || !conversationId) return;
    
    // Gán userId nếu chưa có
    const userId = socket.userId || data.userId;
    
    // Chỉ gửi typing indicator tới receiver
    io.to(receiverId).emit('userTyping', {
      userId: userId,
      conversationId
    });
  });

  socket.on('stopTyping', (data) => {
    const { receiverId, conversationId } = data;
    if (!receiverId || !conversationId) return;
    
    const userId = socket.userId || data.userId;
    
    io.to(receiverId).emit('userStopTyping', {
      userId: userId,
      conversationId
    });
  });

  // Mark messages as read
  socket.on('markRead', (data) => {
    const { conversationId, userId } = data;
    // Notify the other participant that messages were read
    // We'll find the other participant and emit
    socket.broadcast.emit('messagesRead', {
      conversationId,
      readBy: userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up online tracking
    if (socket.userId && onlineUsers.has(socket.userId)) {
      const sockets = onlineUsers.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId);
        // User is fully offline now
        io.emit('userOnline', { userId: socket.userId, online: false });
        console.log(`User ${socket.userId} is now offline`);
      }
    }
  });
});

// API endpoint để kiểm tra online status (single user - public)
app.get('/api/users/online-status/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ online: onlineUsers.has(userId) });
});

// Make io accessible in controllers if needed (using app.set)
app.set('io', io);
app.set('onlineUsers', onlineUsers);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
    await sequelize.sync();
    console.log('MySQL models synchronized');

    await seed();
    await connectMongoDB();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
