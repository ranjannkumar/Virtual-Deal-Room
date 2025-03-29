const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dealRoutes = require('./routes/dealRoutes');
const chatRoutes =  require('./routes/chatRoutes');
const documentRoutes =  require('./routes/documentRoutes')
const http = require('http')
const {Server} = require('socket.io')

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',authRoutes);
app.use('/api/deals',dealRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/documents',documentRoutes);



// Socket.io for Real-time Price Negotiation and notifications
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (dealId) => {
    socket.join(dealId);
    console.log(`User joined deal room: ${dealId}`);
  });

  socket.on('negotiatePrice', ({ dealId, newPrice }) => {
    console.log(`New price negotiation in deal ${dealId}: $${newPrice}`);
    io.to(dealId).emit('priceUpdated', { dealId, newPrice });
  });

  socket.on('sendMessage', ({ dealId, senderId, receiverId, content }) => {
    const message = { dealId, senderId, receiverId, content, isRead: false };
    io.to(dealId).emit('newMessage', message);
  });

  socket.on('typing', ({ dealId, userId }) => {
    socket.to(dealId).emit('userTyping', { userId });
  });

  socket.on('readMessages', ({ dealId }) => {
    io.to(dealId).emit('messagesRead');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
