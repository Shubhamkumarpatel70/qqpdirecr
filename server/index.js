import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { existsSync } from 'fs';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env variables
dotenv.config();

// Validate essential environment variables
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Validate email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS
};

console.log('📧 Email Configuration:', {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  user: emailConfig.user ? 'Configured' : 'Missing',
  pass: emailConfig.pass ? 'Configured' : 'Missing'
});

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app and server
const app = express();
const httpServer = createServer(app);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
  try {
    console.log('🔍 Health check requested');
    
    const formatMemory = (bytes) => `${Math.round(bytes / 1024 / 1024)}MB`;
    
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections).length
      },
      memory: {
        rss: formatMemory(process.memoryUsage().rss),
        heapTotal: formatMemory(process.memoryUsage().heapTotal),
        heapUsed: formatMemory(process.memoryUsage().heapUsed),
        external: formatMemory(process.memoryUsage().external),
        arrayBuffers: formatMemory(process.memoryUsage().arrayBuffers)
      },
      uptime: `${Math.round(process.uptime())} seconds`,
      config: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGO_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        corsOrigins: process.env.NODE_ENV === 'production' 
          ? ['https://quantum-qp-frontend-4ogo.onrender.com']
          : ['http://localhost:3000']
      },
      version: {
        node: process.version,
        mongoose: mongoose.version
      }
    };

    console.log('📊 Health check data:', healthData);
    res.status(200).json(healthData);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  const indexPath = path.join(buildPath, 'index.html');

  // Log build directory information
  console.log('📁 Build directory info:', {
    buildPath,
    indexPath,
    exists: {
      buildDir: existsSync(buildPath),
      indexFile: existsSync(indexPath)
    }
  });

  // Serve static files from the React build directory
  app.use(express.static(buildPath, {
    index: false, // Disable default index serving
    fallthrough: false // Don't fall through to next middleware
  }));

  // Handle root route
  app.get('/', (req, res) => {
    try {
      console.log('📥 Serving index.html for root route');
      if (!existsSync(indexPath)) {
        throw new Error('index.html not found in build directory');
      }
      res.sendFile(indexPath);
    } catch (error) {
      console.error('❌ Error serving index.html:', {
        error: error.message,
        stack: error.stack,
        buildPath,
        indexPath
      });
      res.status(500).json({
        success: false,
        message: 'Error serving frontend application',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle all other routes
  app.get('*', (req, res) => {
    try {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        console.log('❌ API route not found:', req.path);
        return res.status(404).json({
          success: false,
          message: 'API route not found',
          path: req.path,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('📥 Serving index.html for route:', req.path);
      if (!existsSync(indexPath)) {
        throw new Error('index.html not found in build directory');
      }
      res.sendFile(indexPath);
    } catch (error) {
      console.error('❌ Error serving static file:', {
        path: req.path,
        error: error.message,
        stack: error.stack,
        buildPath,
        indexPath
      });
      res.status(500).json({
        success: false,
        message: 'Error serving frontend application',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// 404 Route for API endpoints
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Log detailed error information
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });
  
  // Check for specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Don't expose internal errors in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(500).json({ 
    success: false,
    message: errorMessage,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Log MongoDB connection status
    console.log('📊 MongoDB Connection Status:', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
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
