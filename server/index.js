import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';

dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the process if MongoDB connection fails
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Socket.io for real-time collaboration
io.on('connection', socket => {
  console.log('New client connected');

  socket.on('join-document', documentId => {
    socket.join(documentId);
    console.log(`Client joined document: ${documentId}`);
  });

  socket.on('send-changes', ({ delta, documentId }) => {
    socket.to(documentId).emit('receive-changes', delta);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});