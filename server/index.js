import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env variables
dotenv.config();

// Validate essential environment variables
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app and server
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://quantum-qp-frontend-4ogo.onrender.com']
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://quantum-qp-frontend-4ogo.onrender.com']
    : ['http://localhost:3000'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle all other routes
  app.use((req, res, next) => {
    // Skip if the request is for an API route
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 404 Route for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Socket.io logic
let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  console.log('🔌 New client connected:', socket.id);
  io.emit('activeUsers', activeUsers);

  socket.on('disconnect', () => {
    activeUsers--;
    console.log('❌ Client disconnected:', socket.id);
    io.emit('activeUsers', activeUsers);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`📧 Email Config: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});
