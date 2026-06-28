/**
 * Main Server Entry Point
 * Configures and starts the Express application
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ─── Production Security & Performance Middleware ────────────────────────────

// Use Helmet to set secure HTTP headers
app.use(helmet());

// Compress all HTTP response bodies
app.use(compression());

// Rate Limiter to prevent brute force / DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply rate limiter to all API routes
app.use('/api/', limiter);

// ─── CORS Configuration ──────────────────────────────────────────────────────

// Allow requests from frontend
const allowedOrigins = [
  'https://task-traker-frontend-ruddy.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL, // alias
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl requests (origin is undefined)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Root endpoint as required
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Tracker API Running Successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Tracker API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Task API routes
app.use('/api/tasks', taskRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 Task Tracker API Server Running');
  console.log('─'.repeat(40));
  console.log(`📡 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port        : ${PORT}`);
  console.log('─'.repeat(40) + '\n');
});

// ─── Exception & Rejection Handlers ──────────────────────────────────────────

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (err.stack) console.error(err.stack);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const gracefulShutdown = (signal) => {
  console.log(`\n📶 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('🛑 HTTP server closed.');
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      console.log('📦 MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
